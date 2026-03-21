# Icon Migration Task: Phosphor → Lucide React

## Your Mission

You are replacing **every** `@phosphor-icons/react` import in this codebase with the equivalent `lucide-react` icon. You must do this **manually** — file by file, import by import. **NO automation scripts. NO find-and-replace-all commands. NO regex batch operations.**

Open each file, read it, understand the context, replace the import and all usages.

---

## Rules

1. **Manual only** — open each file, read the import, replace it. No scripts.
2. **Monochrome only** — icons must render in the text color of their parent (`currentColor`). No colored icons. No bold/fill variants. Use the default stroke style.
3. **Remove the `weight` prop** — Phosphor uses `weight="light"` / `weight="bold"` etc. Lucide doesn't have this. Just remove the `weight` prop entirely.
4. **Keep `className`** — preserve all existing `className` props on icons (`h-4 w-4`, `mr-2`, etc.).
5. **Do NOT change any logic** — only change the icon import and JSX tag name. Don't touch any surrounding code.
6. **After ALL files are done**, run `npx tsc --noEmit --pretty` to verify zero TypeScript errors.
7. **Then** uninstall Phosphor: `npm uninstall @phosphor-icons/react`

---

## Icon Mapping Table

Replace every Phosphor icon (left) with its Lucide equivalent (right):

| Phosphor Icon | Lucide Icon | Lucide Import Name |
|---|---|---|
| `ArrowCircleUp` | `ArrowUpCircle` | `ArrowUpCircle` |
| `ArrowCounterClockwise` | `RotateCcw` | `RotateCcw` |
| `ArrowDownRight` | `ArrowDownRight` | `ArrowDownRight` |
| `ArrowLeft` | `ArrowLeft` | `ArrowLeft` |
| `ArrowRight` | `ArrowRight` | `ArrowRight` |
| `ArrowsClockwise` | `RefreshCw` | `RefreshCw` |
| `ArrowsCounterClockwise` | `RefreshCcw` | `RefreshCcw` |
| `ArrowsDownUp` | `ArrowDownUp` | `ArrowDownUp` |
| `ArrowsLeftRight` | `ArrowLeftRight` | `ArrowLeftRight` |
| `ArrowSquareOut` | `ExternalLink` | `ExternalLink` |
| `ArrowUpRight` | `ArrowUpRight` | `ArrowUpRight` |
| `Bell` | `Bell` | `Bell` |
| `BookOpen` | `BookOpen` | `BookOpen` |
| `BookOpenText` | `BookOpenText` | `BookOpenText` |
| `Brain` | `Brain` | `Brain` |
| `Building` | `Building` | `Building` |
| `Buildings` | `Building2` | `Building2` |
| `Calculator` | `Calculator` | `Calculator` |
| `Calendar` | `Calendar` | `Calendar` |
| `CalendarBlank` | `CalendarDays` | `CalendarDays` |
| `Camera` | `Camera` | `Camera` |
| `Cards` | `LayoutGrid` | `LayoutGrid` |
| `CaretDown` | `ChevronDown` | `ChevronDown` |
| `CaretLeft` | `ChevronLeft` | `ChevronLeft` |
| `CaretRight` | `ChevronRight` | `ChevronRight` |
| `CaretUp` | `ChevronUp` | `ChevronUp` |
| `CaretUpDown` | `ChevronsUpDown` | `ChevronsUpDown` |
| `ChartBar` | `BarChart3` | `BarChart3` |
| `ChartLineUp` | `TrendingUp` | `TrendingUp` |
| `Check` | `Check` | `Check` |
| `CheckCircle` | `CheckCircle2` | `CheckCircle2` |
| `Checks` | `CheckCheck` | `CheckCheck` |
| `Circle` | `Circle` | `Circle` |
| `CircleNotch` | `Loader2` | `Loader2` |
| `Clock` | `Clock` | `Clock` |
| `Code` | `Code` | `Code` |
| `Copy` | `Copy` | `Copy` |
| `CurrencyDollar` | `DollarSign` | `DollarSign` |
| `Database` | `Database` | `Database` |
| `Dot` | `Dot` | `Dot` |
| `DotsSixVertical` | `GripVertical` | `GripVertical` |
| `DotsThree` | `MoreHorizontal` | `MoreHorizontal` |
| `DotsThreeVertical` | `MoreVertical` | `MoreVertical` |
| `DownloadSimple` | `Download` | `Download` |
| `EnvelopeSimple` | `Mail` | `Mail` |
| `Eye` | `Eye` | `Eye` |
| `EyeSlash` | `EyeOff` | `EyeOff` |
| `File` | `File` | `File` |
| `FileArrowUp` | `FileUp` | `FileUp` |
| `FileCode` | `FileCode` | `FileCode` |
| `FileCsv` | `FileSpreadsheet` | `FileSpreadsheet` |
| `FileText` | `FileText` | `FileText` |
| `FileZip` | `FileArchive` | `FileArchive` |
| `Fire` | `Flame` | `Flame` |
| `FloppyDisk` | `Save` | `Save` |
| `Funnel` | `Filter` | `Filter` |
| `Gauge` | `Gauge` | `Gauge` |
| `Gear` | `Settings` | `Settings` |
| `Ghost` | `Ghost` | `Ghost` |
| `GitBranch` | `GitBranch` | `GitBranch` |
| `Globe` | `Globe` | `Globe` |
| `HardDrive` | `HardDrive` | `HardDrive` |
| `Hash` | `Hash` | `Hash` |
| `Heart` | `Heart` | `Heart` |
| `House` | `Home` | `Home` |
| `Image` | `Image` | `Image` |
| `Info` | `Info` | `Info` |
| `Key` | `Key` | `Key` |
| `Lightbulb` | `Lightbulb` | `Lightbulb` |
| `Lightning` | `Zap` | `Zap` |
| `Link` | `Link` | `Link` |
| `List` | `List` | `List` |
| `ListBullets` | `List` | `List` |
| `ListNumbers` | `ListOrdered` | `ListOrdered` |
| `Lock` | `Lock` | `Lock` |
| `MagnifyingGlass` | `Search` | `Search` |
| `Medal` | `Medal` | `Medal` |
| `Minus` | `Minus` | `Minus` |
| `Moon` | `Moon` | `Moon` |
| `Newspaper` | `Newspaper` | `Newspaper` |
| `Notebook` | `Notebook` | `Notebook` |
| `NotePencil` | `PenLine` | `PenLine` |
| `Package` | `Package` | `Package` |
| `Pencil` | `Pencil` | `Pencil` |
| `PencilSimple` | `PenLine` | `PenLine` |
| `Percent` | `Percent` | `Percent` |
| `Play` | `Play` | `Play` |
| `Plus` | `Plus` | `Plus` |
| `Pulse` | `Activity` | `Activity` |
| `Rocket` | `Rocket` | `Rocket` |
| `Shield` | `Shield` | `Shield` |
| `ShieldCheck` | `ShieldCheck` | `ShieldCheck` |
| `SidebarSimple` | `PanelLeft` | `PanelLeft` |
| `SignOut` | `LogOut` | `LogOut` |
| `Snowflake` | `Snowflake` | `Snowflake` |
| `Sparkle` | `Sparkles` | `Sparkles` |
| `SquaresFour` | `LayoutDashboard` | `LayoutDashboard` |
| `Stack` | `Layers` | `Layers` |
| `Strategy` | `Route` | `Route` |
| `Sun` | `Sun` | `Sun` |
| `Tag` | `Tag` | `Tag` |
| `Target` | `Target` | `Target` |
| `Terminal` | `Terminal` | `Terminal` |
| `TextB` | `Bold` | `Bold` |
| `TextHOne` | `Heading1` | `Heading1` |
| `TextHThree` | `Heading3` | `Heading3` |
| `TextHTwo` | `Heading2` | `Heading2` |
| `TextItalic` | `Italic` | `Italic` |
| `TextStrikethrough` | `Strikethrough` | `Strikethrough` |
| `TextUnderline` | `Underline` | `Underline` |
| `Trash` | `Trash2` | `Trash2` |
| `TreeEvergreen` | `TreePine` | `TreePine` |
| `TrendDown` | `TrendingDown` | `TrendingDown` |
| `TrendUp` | `TrendingUp` | `TrendingUp` |
| `Trophy` | `Trophy` | `Trophy` |
| `Upload` | `Upload` | `Upload` |
| `UploadSimple` | `Upload` | `Upload` |
| `User` | `User` | `User` |
| `Users` | `Users` | `Users` |
| `Warning` | `AlertTriangle` | `AlertTriangle` |
| `WarningCircle` | `AlertCircle` | `AlertCircle` |
| `Wrench` | `Wrench` | `Wrench` |
| `X` | `X` | `X` |
| `XCircle` | `XCircle` | `XCircle` |

---

## How to Handle Aliases

Many files use Phosphor aliases like `Gear as SettingsIcon`. Replace the import but **keep the alias** if the component uses it:

**Before:**
```tsx
import { Gear as SettingsIcon } from "@phosphor-icons/react"
```

**After:**
```tsx
import { Settings as SettingsIcon } from "lucide-react"
```

Other common aliases in this codebase:
- `DownloadSimple as Download` → just `Download` (no alias needed since Lucide name IS `Download`)
- `MagnifyingGlass as Search` → just `Search`
- `CircleNotch as Loader2` → just `Loader2`
- `FileCsv as FileSpreadsheet` → just `FileSpreadsheet`
- `ChartBar as BarChart3` → just `BarChart3`

If the alias matches the Lucide name, drop the alias. If the rest of the file uses the alias name in JSX, keep the alias.

---

## How to Handle `weight` Prop

**Before:**
```tsx
<Moon weight="light" className="h-4 w-4" />
```

**After:**
```tsx
<Moon className="h-4 w-4" />
```

Just remove `weight="light"`, `weight="bold"`, `weight="fill"`, `weight="duotone"`, `weight="thin"`, or `weight="regular"`. Lucide icons don't have this prop.

---

## How to Handle `Icon` type import

If any file imports `Icon` from Phosphor as a type, replace with:
```tsx
import { LucideIcon } from "lucide-react"
```
And use `LucideIcon` wherever `Icon` was used as a type.

---

## File-by-File Checklist

Process every file in this order. Check off each one as you complete it:

1. `app/global-error.tsx`
2. `app/page.tsx` (login — uses Moon)
3. `app/docs/page.tsx`
4. `app/docs/layout.tsx`
5. `app/docs/getting-started/page.tsx`
6. `app/docs/for-developers/*.tsx` (all files in this dir)
7. `app/dashboard/components/navbar.tsx`
8. `app/dashboard/components/sidebar/dashboard-sidebar.tsx`
9. `app/dashboard/components/widget-grid.tsx`
10. `app/dashboard/components/widget-library-dialog.tsx`
11. `app/dashboard/components/kpi-widget-selector.tsx`
12. `app/dashboard/components/empty-account-state.tsx`
13. `app/dashboard/components/edit-mode-controls.tsx`
14. `app/dashboard/components/kpi/*.tsx` (all KPI widgets)
15. `app/dashboard/components/charts/*.tsx` (all chart widgets)
16. `app/dashboard/components/tables/*.tsx` (all table components)
17. `app/dashboard/components/filters/*.tsx` (all filter components)
18. `app/dashboard/components/import/*.tsx` (all import components)
19. `app/dashboard/components/journal/*.tsx`
20. `app/dashboard/components/tags/*.tsx`
21. `app/dashboard/components/prop-firm/*.tsx`
22. `app/dashboard/components/accounts/*.tsx`
23. `app/dashboard/components/navbar-filters/*.tsx`
24. `app/dashboard/components/seasonal/*.tsx`
25. `app/dashboard/accounts/page.tsx`
26. `app/dashboard/accounts/[id]/page.tsx`
27. `app/dashboard/backtesting/components/*.tsx`
28. `app/dashboard/journal/components/*.tsx`
29. `app/dashboard/playbook/*.tsx`
30. `app/dashboard/prop-firm/**/*.tsx` (all nested)
31. `app/dashboard/reports/**/*.tsx` (all nested)
32. `app/dashboard/settings/**/*.tsx`
33. `app/dashboard/data/**/*.tsx`
34. `app/dashboard/table/page.tsx`
35. `components/notifications/notification-center.tsx`
36. `components/theme-switcher.tsx`
37. Any remaining files with `@phosphor-icons/react`

---

## Final Steps

After ALL replacements:

```bash
# 1. Verify no Phosphor imports remain
grep -r "@phosphor-icons/react" --include='*.tsx' --include='*.ts' .

# 2. TypeScript check
npx tsc --noEmit --pretty

# 3. If zero errors, uninstall Phosphor
npm uninstall @phosphor-icons/react
```

**DO NOT skip any file. DO NOT use automation scripts. Do each file manually.**
