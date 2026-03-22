import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdSafe, createClient } from '@/server/auth'
import JSZip from 'jszip'

// Helper to find file by partial name matches in ZIP
function findImageFile(zipFiles: { [key: string]: JSZip.JSZipObject }, folder: string, id: string, suffix: string) {
  // We look for images/folder/id_suffix.ext
  // Iterate object keys? No, slow.
  // Try standard extensions
  const extensions = ['png', 'jpg', 'jpeg', 'webp', 'gif']
  for (const ext of extensions) {
    const path = `images/${folder}/${id}_${suffix}.${ext}`
    if (zipFiles[path]) return { file: zipFiles[path], ext }
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdSafe()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Load ZIP
    const arrayBuffer = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(arrayBuffer)

    // Read Manifest
    const manifestFile = zip.file('data.json')
    if (!manifestFile) {
      return NextResponse.json({ error: 'Invalid export file (missing data.json)' }, { status: 400 })
    }

    const manifestContent = await manifestFile.async('string')
    const data = JSON.parse(manifestContent)

    // Get Internal User ID
    const user = await prisma.user.findUnique({
      where: { auth_user_id: userId },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }
    const internalUserId = user.id

    // Setup Supabase for Storage
    const supabase = await createClient()

    // --- RECONSTRUCTION PHASE ---

    // 0. Update User Settings
    if (data.user) {
      await prisma.user.update({
        where: { id: internalUserId },
        data: {
          timezone: data.user.timezone,
          timeFormat: data.user.timeFormat,
          theme: data.user.theme,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          accountFilterSettings: data.user.accountFilterSettings,
          goalSettings: data.user.goalSettings,
          backtestInputMode: data.user.backtestInputMode,
          accentPack: data.user.accentPack,
          autoAdjustAccountDate: data.user.autoAdjustAccountDate,
          calendarDisplayStats: data.user.calendarDisplayStats,
          showWeeklySummary: data.user.showWeeklySummary
        }
      })
    }

    // 1. Trade Tags
    if (data.tradeTags) {
      for (const tag of data.tradeTags) {
        await prisma.tradeTag.upsert({
          where: { name_userId: { name: tag.name, userId: internalUserId } },
          update: { color: tag.color },
          create: {
            id: crypto.randomUUID(),
            userId: internalUserId,
            name: tag.name,
            color: tag.color,
            updatedAt: new Date()
          }
        })
      }
    }

    // 2. Trading Models
    const modelNameMap = new Map<string, string>()
    if (data.tradingModels) {
      for (const model of data.tradingModels) {
        const target = await prisma.tradingModel.upsert({
          where: { userId_name: { userId: internalUserId, name: model.name } },
          update: { rules: model.rules, notes: model.notes },
          create: {
            id: crypto.randomUUID(),
            userId: internalUserId,
            name: model.name,
            rules: model.rules ?? [],
            notes: model.notes
          }
        })
        modelNameMap.set(model.name, target.id)
      }
    }

    // 3. Dashboard Templates
    if (data.dashboardTemplates) {
      for (const dash of data.dashboardTemplates) {
        await prisma.dashboardTemplate.upsert({
          where: { userId_name: { userId: internalUserId, name: dash.name } },
          update: { layout: dash.layout, isActive: dash.isActive, isDefault: dash.isDefault },
          create: {
            id: crypto.randomUUID(),
            userId: internalUserId,
            name: dash.name,
            layout: dash.layout,
            isActive: dash.isActive,
            isDefault: dash.isDefault,
            updatedAt: new Date()
          }
        })
      }
    }

    // 4. Accounts (Live)
    const accountMap = new Map<string, string>()
    if (data.accounts) {
      for (const acc of data.accounts) {
        const target = await prisma.account.upsert({
          where: { number_userId: { number: acc.number, userId: internalUserId } },
          update: { name: acc.name, broker: acc.broker, startingBalance: acc.startingBalance, isArchived: acc.isArchived },
          create: {
            id: crypto.randomUUID(),
            userId: internalUserId,
            number: acc.number,
            name: acc.name,
            broker: acc.broker,
            startingBalance: acc.startingBalance || 0,
            isArchived: acc.isArchived || false
          }
        })
        accountMap.set(acc.number, target.id)
      }
    }

    // 5. Master Accounts & Phases
    const phaseMap = new Map<string, string>() // phaseId String -> InternalID
    const masterMap = new Map<string, string>() // Name -> InternalID
    if (data.masterAccounts) {
      for (const ma of data.masterAccounts) {
        const targetMa = await prisma.masterAccount.upsert({
          where: { userId_accountName: { userId: internalUserId, accountName: ma.accountName } },
          update: { 
            propFirmName: ma.propFirmName, 
            accountSize: ma.accountSize, 
            evaluationType: ma.evaluationType, 
            currentPhase: ma.currentPhase, 
            status: ma.status, 
            isArchived: ma.isArchived 
          },
          create: {
            id: crypto.randomUUID(),
            userId: internalUserId,
            accountName: ma.accountName,
            propFirmName: ma.propFirmName,
            accountSize: ma.accountSize,
            evaluationType: ma.evaluationType,
            currentPhase: ma.currentPhase,
            status: ma.status,
            isArchived: ma.isArchived
          }
        })
        masterMap.set(ma.accountName, targetMa.id)

        if (ma.PhaseAccount) {
          for (const phase of ma.PhaseAccount) {
            const targetPhase = await prisma.phaseAccount.upsert({
              where: { masterAccountId_phaseNumber: { masterAccountId: targetMa.id, phaseNumber: phase.phaseNumber } },
              update: { 
                phaseId: phase.phaseId, 
                status: phase.status, 
                profitTargetPercent: phase.profitTargetPercent,
                dailyDrawdownPercent: phase.dailyDrawdownPercent,
                maxDrawdownPercent: phase.maxDrawdownPercent,
                startDate: phase.startDate ? new Date(phase.startDate) : undefined
              },
              create: {
                id: crypto.randomUUID(),
                masterAccountId: targetMa.id,
                phaseNumber: phase.phaseNumber,
                phaseId: phase.phaseId,
                profitTargetPercent: phase.profitTargetPercent,
                dailyDrawdownPercent: phase.dailyDrawdownPercent,
                maxDrawdownPercent: phase.maxDrawdownPercent,
                status: phase.status,
                startDate: phase.startDate ? new Date(phase.startDate) : undefined
              }
            })
            if (phase.phaseId) phaseMap.set(phase.phaseId, targetPhase.id)
          }
        }
      }
    }

    // --- TRANSITIONAL DATA ---

    // 6. Transactions
    if (data.liveAccountTransactions) {
      for (const tx of data.liveAccountTransactions) {
        // Linking by match (simplistic for history)
        const targetAccountId = accountMap.get(tx.accountNumber)
        if (targetAccountId) {
          const existing = await prisma.liveAccountTransaction.findFirst({
            where: { accountId: targetAccountId, amount: tx.amount, createdAt: new Date(tx.createdAt) }
          })
          if (!existing) {
            await prisma.liveAccountTransaction.create({
              data: {
                id: crypto.randomUUID(),
                accountId: targetAccountId,
                userId: internalUserId,
                type: tx.type,
                amount: tx.amount,
                description: tx.description,
                createdAt: new Date(tx.createdAt)
              }
            })
          }
        }
      }
    }

    // 7. Breach Records, Daily Anchors, Payouts
    if (data.breachRecords) {
      for (const br of data.breachRecords) {
        const targetPhaseId = phaseMap.get(br.phaseId) // br.phaseId in export was the PhaseAccount.phaseId string
        if (targetPhaseId) {
          const existing = await prisma.breachRecord.findFirst({
            where: { phaseAccountId: targetPhaseId, breachType: br.breachType, breachTime: new Date(br.breachTime) }
          })
          if (!existing) {
            await prisma.breachRecord.create({
              data: {
                id: crypto.randomUUID(),
                phaseAccountId: targetPhaseId,
                breachType: br.breachType,
                breachAmount: br.breachAmount,
                breachTime: new Date(br.breachTime),
                currentEquity: br.currentEquity,
                accountSize: br.accountSize,
                dailyStartBalance: br.dailyStartBalance,
                highWaterMark: br.highWaterMark,
                notes: br.notes
              }
            })
          }
        }
      }
    }

    if (data.dailyAnchors) {
      for (const da of data.dailyAnchors) {
        const targetPhaseId = phaseMap.get(da.phaseId)
        if (targetPhaseId) {
          await prisma.dailyAnchor.upsert({
            where: { phaseAccountId_date: { phaseAccountId: targetPhaseId, date: new Date(da.date) } },
            update: { anchorEquity: da.anchorEquity },
            create: {
              id: crypto.randomUUID(),
              phaseAccountId: targetPhaseId,
              date: new Date(da.date),
              anchorEquity: da.anchorEquity
            }
          })
        }
      }
    }

    if (data.payouts) {
      for (const p of data.payouts) {
        const targetMasterId = masterMap.get(p.accountName)
        const targetPhaseId = p.phaseId ? phaseMap.get(p.phaseId) : null
        if (targetMasterId && targetPhaseId) {
          const existing = await prisma.payout.findFirst({
            where: { masterAccountId: targetMasterId, phaseAccountId: targetPhaseId, amount: p.amount, requestDate: new Date(p.requestDate) }
          })
          if (!existing) {
            await prisma.payout.create({
              data: {
                id: crypto.randomUUID(),
                masterAccountId: targetMasterId,
                phaseAccountId: targetPhaseId,
                amount: p.amount,
                status: p.status,
                requestDate: new Date(p.requestDate),
                approvedDate: p.approvedDate ? new Date(p.approvedDate) : null,
                paidDate: p.paidDate ? new Date(p.paidDate) : null,
                rejectedDate: p.rejectedDate ? new Date(p.rejectedDate) : null,
                notes: p.notes,
                rejectionReason: p.rejectionReason
              }
            })
          }
        }
      }
    }

    // --- TRADES & BACKTESTS ---

    let importedCount = 0
    let skippedCount = 0

    // Helper to upload image
    const uploadImage = async (zipFolder: string, originalId: string, suffix: string, newId: string) => {
      const result = findImageFile(zip.files, zipFolder, originalId, suffix)
      if (!result) return null

      const buffer = await result.file.async('arraybuffer')
      const path = `trades/${internalUserId}/${newId}/${suffix}.${result.ext}`

      const { data: uploadData, error } = await supabase.storage
        .from('trade-images')
        .upload(path, buffer, {
          contentType: `image/${result.ext}`,
          upsert: true
        })

      if (error || !uploadData) return null

      const { data: { publicUrl } } = supabase.storage.from('trade-images').getPublicUrl(path)
      return publicUrl
    }

    const uploadTradeImages = async (trade: any, newId: string) => {
      const suffixes = ['1', '2', '3', '4', '5', '6', 'preview']
      const results: any = {}
      for (const s of suffixes) {
        const dbField = s === 'preview' ? 'cardPreviewImage' : `image${['One','Two','Three','Four','Five','Six'][parseInt(s)-1]}`
        const url = await uploadImage('trades', trade.originalId || trade.id, s, newId)
        if (url) results[dbField] = url
      }
      return results
    }

    if (data.trades) {
      for (const t of data.trades) {
        const existing = await prisma.trade.findFirst({
          where: {
            userId: internalUserId,
            accountNumber: t.accountNumber,
            instrument: t.instrument,
            entryDate: t.entryDate,
            entryPrice: t.entryPrice,
            side: t.side,
            quantity: parseFloat(t.quantity || 0)
          }
        })
        if (existing) { skippedCount++; continue; }

        const newId = crypto.randomUUID()
        const images = await uploadTradeImages(t, newId)
        
        const accountId = accountMap.get(t.accountNumber) || null
        const phaseAccountId = phaseMap.get(t.accountNumber) || null
        const modelId = t.modelName ? modelNameMap.get(t.modelName) : null

        const { id, userId, originalId, modelName, ...rest } = t
        await prisma.trade.create({
          data: {
            ...rest,
            ...images,
            id: newId,
            userId: internalUserId,
            accountId,
            phaseAccountId,
            modelId,
            quantity: parseFloat(t.quantity || 0),
            pnl: parseFloat(t.pnl || 0)
          }
        })
        importedCount++
      }
    }

    if (data.backtestTrades) {
      for (const bt of data.backtestTrades) {
        const newId = crypto.randomUUID()
        const existing = await prisma.backtestTrade.findFirst({
          where: {
            userId: internalUserId,
            pair: bt.pair,
            dateExecuted: bt.dateExecuted,
            entryPrice: bt.entryPrice,
            direction: bt.direction
          }
        })

        if (!existing) {
          const originalId = bt.id
          const images: any = {}
          const suffixes = ['1', '2', '3', '4', '5', '6', 'preview']
          for (const s of suffixes) {
            const dbField = s === 'preview' ? 'cardPreviewImage' : `image${['One','Two','Three','Four','Five','Six'][parseInt(s)-1]}`
            const url = await uploadImage('backtest', originalId, s, newId)
            if (url) images[dbField] = url
          }

          const { id, userId, ...rest } = bt
          await prisma.backtestTrade.create({
            data: {
              ...rest,
              ...images,
              userId: internalUserId,
              id: newId,
            }
          })
          importedCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported: importedCount,
      skipped: skippedCount,
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Import failed: ' + (error as Error).message }, { status: 500 })
  }
}
