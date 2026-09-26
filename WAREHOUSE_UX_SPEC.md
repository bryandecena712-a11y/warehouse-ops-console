# Warehouse Ops Console — UI/UX Design Specification & Wireframe Plan

## 1. Product intent

Warehouse Ops Console is a desktop-first B2B SaaS workspace for warehouse staff and inventory managers. It is optimized for fast scanning, low-error data entry, and clear operational handoffs across receiving, inventory, picking, stock control, and reporting.

### Primary users
- **Warehouse staff:** receive goods, pick orders, update statuses, and resolve exceptions.
- **Inventory manager:** monitor stock health, review movements, maintain the product catalog, and export reports.
- **Operations lead:** scan throughput, open work, alerts, and recent activity from the dashboard.

### Core experience principles
1. **Scan before reading:** KPI cards, status chips, section labels, and color anchors reveal the situation in under five seconds.
2. **Keep context:** details open in a side drawer or modal rather than forcing a full-page detour.
3. **Prevent, then explain:** validation, availability checks, and confirmation states appear before irreversible actions.
4. **One clear next step:** every screen has one primary action and a visible escape route.
5. **Operational language:** use concrete terms such as “Ready to pick,” “12 units,” and “A-14-03” instead of abstract labels.

## 2. Visual system

### Brand direction: “Night shift cockpit”
- **Base:** deep ink navy (`#10151F`) for the shell, near-white fog (`#F7F8FA`) for the work area.
- **Primary action:** safety coral (`#F2684B`) for receive, pick, confirm, and save actions.
- **Positive:** warehouse green (`#2FA36B`) for available stock, completion, and inbound confirmation.
- **Warning:** amber (`#E9A23B`) for low stock, aging orders, and review-needed conditions.
- **Critical:** red (`#D95C5C`) for out of stock, blocked, or destructive actions.
- **Secondary signal:** electric blue (`#5C8DFF`) for links, data highlights, and neutral system information.

### Typography
- **Display / page titles:** `DM Sans`, 700 weight; compact and confident.
- **UI / body:** `Inter`, 400–600; highly legible at 13–15px.
- **Monospace metadata:** `IBM Plex Mono` for SKUs, order IDs, delivery numbers, and timestamps.

### Spacing and shape
- 4px base unit; common gaps are 8 / 12 / 16 / 24 / 32px.
- Cards use 16px radius and a 1px low-contrast border; elevated drawers use a soft shadow rather than a heavy border.
- Buttons use 10–12px radius, 40px default height, and a visible pressed state.
- Content max width is 1440px with a 32px desktop gutter and 20px mobile gutter.

### Accessibility
- All icon-only buttons have `aria-label` and tooltip text.
- Status is never communicated by color alone: each chip includes a label and, where relevant, an icon.
- Focus rings use 3px coral/blue outlines with 2px offset.
- Minimum body size is 13px; tap targets are at least 40px.
- Tables collapse into stacked records on narrow screens; side navigation becomes a slide-over.
- Motion is limited to 160–220ms transitions and respects reduced-motion preferences.

## 3. Global information architecture

### Persistent shell
- **Left rail:** brand mark, workspace label, seven module links, bottom help / user profile.
- **Top bar:** breadcrumb, global search (`⌘K` hint), notification bell with unread count, current user.
- **Main canvas:** page title, contextual subtitle, one primary CTA, then the working content.
- **Toasts:** success, warning, and error feedback anchored bottom-right; never rely on a toast alone for critical confirmation.

### Navigation labels
1. Overview
2. Inventory
3. Receiving
4. Orders & picking
5. Stock movements
6. Reports & alerts
7. User & access

The prototype uses Overview, Inventory, Receiving, Orders & picking, Stock movements, and Reports & alerts as module routes. User & access is represented by the login gate, profile menu, and sign-out interaction.

## 4. Screen inventory and wireframes

### Screen 00 — Login / access gate
**Goal:** safely enter the workspace and make session state visible.

**Wireframe**
```
┌───────────────────────────────┬────────────────────────────────────────────┐
│ Brand / warehouse illustration │  Welcome back                             │
│ Shift note + operational stats │  Email or username [____________________] │
│                               │  Password            [____________________] │
│                               │  □ Remember this device                    │
│                               │  [ Sign in to workspace ]                  │
│                               │  Error: invalid credentials (conditional)   │
└───────────────────────────────┴────────────────────────────────────────────┘
```

**States:** pristine, validation error, wrong-password error, loading, success → Overview. Required fields are marked inline; no error clears the form unexpectedly.

### Screen 01 — Overview dashboard
**Goal:** answer “What needs attention right now?”

**Wireframe**
```
┌─ rail ─┐ ┌─ top bar: breadcrumb / search / notifications / profile ─────────┐
│        │ │ Overview                              [Receive stock] [New order]  │
│        │ ├───────────────────────────────────────────────────────────────────┤
│        │ │ [Products] [Available units] [Low stock] [Orders to pick]         │
│        │ ├─────────────────────────────┬─────────────────────────────────────┤
│        │ │ Low-stock attention          │ Incoming deliveries                  │
│        │ │ 3 alert rows + view inventory │ delivery table + receive CTA        │
│        │ ├─────────────────────────────┼─────────────────────────────────────┤
│        │ │ Activity timeline            │ Shift pulse / throughput chart      │
└────────┘ └─────────────────────────────┴─────────────────────────────────────┘
```

**Interactions:** KPI click filters the relevant module; low-stock “Review” opens the product drawer; delivery CTA starts Receiving at step 1; notification bell opens the alert tray.

### Screen 02 — Inventory list
**Goal:** find, understand, and edit any SKU without leaving the operational context.

**Wireframe**
```
Header: Inventory / Catalog health                         [Add product]
Summary: 248 total / 18 low / 4 out of stock
Toolbar: [Search SKU or product] [Status] [Category] [Location] [Columns]
┌──────────────────────────────────────────────────────────────────────────────┐
│ □ SKU       Product          Category   Qty   Location  Status     Supplier   │
│ □ HM-104    Harbor mug       Kitchen    184   A-14-03   In stock   Northstar  │
│ □ LS-220    Linen set        Textiles    12   B-02-18   Low stock  Loom & Co  │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Interactions:** row click opens right-side product drawer; filter chips are removable; add/edit uses a validated modal; delete requires a confirmation dialog with the SKU name and a reversible “Undo” toast.

### Screen 03 — Product details drawer
**Goal:** provide operational context before a replenishment or adjustment decision.

**Drawer zones:** SKU header + status; quantity and reorder point; location card; supplier; recent movements; actions `[Edit product] [Adjust stock]`.

### Screen 04 — Add / edit product modal
**Goal:** create or update a catalog record with clear validation.

**Fields:** SKU, product name, category, quantity, reorder point, warehouse zone/bin, supplier. Inline errors explain format and value constraints. Save is disabled until required fields are valid.

### Screen 05 — Receiving flow
**Goal:** turn a delivery into auditable stock with minimal re-entry.

**Wireframe**
```
Receiving stock  ● What  ─  ○ How much  ─  ○ From whom  ─  ○ Review
┌───────────────────────────────┬────────────────────────────────────────────┐
│ Step-specific form            │ Live receipt summary                         │
│ Product [search/select]       │ Product / quantity / supplier / date          │
│ Quantity [____]               │                                               │
│ Condition [Good v]            │                                               │
│ [Back] [Continue]             │                                               │
└───────────────────────────────┴────────────────────────────────────────────┘
```

**Steps:** What (product + delivery number) → How much (quantity + condition) → From whom (supplier + receipt date) → Review. Review includes a confirmation dialog before commit; success state shows received quantity, new stock level, and next actions.

### Screen 06 — Orders & picking
**Goal:** prioritize and complete picking work safely.

**Wireframe**
```
Orders & picking                                  [Scan next order]
Tabs: [All 24] [Pending 8] [Picking 6] [Ready 4] [Completed]
┌──────────────────────┬──────────────────────────────────────────────────────┐
│ Order queue          │ Order detail / pick list                             │
│ SO-10482  Picking    │ SO-10482  Acme Retail  / 4 line items                 │
│ SO-10477  Pending    │ progress 2/4                                         │
│ SO-10463  Ready      │ □ 2x Harbor mug A-14-03   [Mark picked]              │
│                      │ □ 1x Linen set  B-02-18   [Mark picked]              │
│                      │ [Move to ready] [Complete order]                     │
└──────────────────────┴──────────────────────────────────────────────────────┘
```

**Flow:** Pending → Picking → Ready → Completed. A stock-shortage banner blocks completion until the user chooses “Backorder,” “Partial fulfill,” or “Replenish.” Picking uses large check targets and progress feedback.

### Screen 07 — Stock movements
**Goal:** explain how a quantity changed and who performed the action.

**Wireframe**
```
Stock movements  [Search] [Movement type] [Date range] [Export]
┌──────────────────────────────────────────────────────────────────────────────┐
│ Timestamp  Product    Type       Before  Change  After  User     Reference   │
│ 09:42      Harbor mug Received   136     +48     184    M. Chen   RC-00918    │
└──────────────────────────────────────────────────────────────────────────────┘

Audit trail: Received → Adjusted → Released with before/after blocks
```

Positive and negative movement values carry explicit `+` / `−` prefixes. Selecting a row reveals the audit trail and source reference.

### Screen 08 — Reports & alert center
**Goal:** move from live operations to trends, exports, and prioritized notifications.

**Wireframe**
```
Reports & alerts                         [Export report]
Tabs: [Report dashboard] [Notifications 5]
┌─────────────────────────────┬───────────────────────────────────────────────┐
│ Report cards                │ Notification center                             │
│ Inventory health            │ Critical: Linen set below reorder point         │
│ Low stock                   │ Warning: 3 orders aging past 4h                 │
│ Stock movement              │ Info: Delivery RC-00918 received                │
│ Order throughput            │ [Mark all read] [View inventory]                 │
└─────────────────────────────┴───────────────────────────────────────────────┘
```

Reports use summary cards, a small bar/area chart, a compact detail table, and export actions. Notifications are grouped by priority and retain timestamps plus a clear deep link.

## 5. Required flows

### Flow A — Receive new inventory
1. Overview → click **Receive stock**.
2. Step 1: choose product and enter delivery number.
3. Step 2: enter quantity and condition; inline validation prevents zero/negative quantity.
4. Step 3: select supplier and receipt date.
5. Step 4: review before/after quantity and confirm in modal.
6. Success state confirms the updated stock and offers **View inventory** / **Receive another**.

### Flow B — Process an order
1. Overview → **View picking queue**.
2. Orders & picking → choose a pending order.
3. Click **Start picking**; status becomes Picking.
4. Check each line item as picked; availability warnings stay visible.
5. Click **Move to ready**; verify progress is 100%.
6. Click **Complete order**; success toast and status become Completed.

### Flow C — Manage low stock
1. Overview → click a Low stock KPI or alert row.
2. Inventory opens with the status filter set to Low stock.
3. Click a product → details drawer reveals reorder point, location, supplier, and movement history.
4. Choose **Adjust stock** or **Edit product** based on the operational decision.

## 6. Interaction and state matrix

| Component | Default | Hover/focus | Loading | Success | Error / prevention |
|---|---|---|---|---|---|
| Primary CTA | Coral fill | Slight lift + darker fill | Label replaced with spinner | Toast + updated data | Disabled with reason or inline field error |
| Status chip | Label + color | No movement | Neutral skeleton | Stable | Never color-only |
| Table row | White surface | Blue tint + pointer | Row skeleton | Updated row | Empty state with next action |
| Drawer | Hidden | N/A | Content skeleton | Stays open after save | Escape/backdrop closes safely |
| Destructive dialog | Hidden | N/A | N/A | Undo toast | Explicit object name + cancel affordance |
| Multi-step form | Active step | Step label emphasis | Continue disabled until valid | Success summary | Inline error next to field |

## 7. Prototype acceptance checklist

- [x] Login gate, user display, and logout are represented.
- [x] All seven brief modules are reachable from the shell.
- [x] Inventory search, status filters, product drawer, add/edit, and delete confirmation are interactive.
- [x] Receiving has a multi-step form, review, confirmation, cancel/draft behavior, and success state.
- [x] Picking demonstrates Pending → Picking → Ready → Completed with checklist feedback.
- [x] Movement table contains before/after stock and responsible user.
- [x] Reports and notifications include summary, chart, filters, unread state, and export affordance.
- [x] Required states include loading, empty/filtered, error feedback, and success feedback.
- [x] Desktop-first layout collapses navigation and tables for mobile widths.
