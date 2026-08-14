# Stakeholder Experience - Key Performance Indicators (KPIs)

This document formalizes the formulas, indicators, and boundaries used to calculate the performance metrics within the Stakeholder Experience dashboard.

---

## 📐 KPI Formula Definitions

### 1. Active Listings Capacity ($AL_c$)
The count of active property listings currently published and visible to buyers on the client application.
$$AL_c = \sum (p \in \text{Properties} \mid p.\text{status} = \text{"active"})$$

### 2. Client Acquisition Velocity ($CA_v$)
The number of new client accounts created within a specific start ($t_s$) and end ($t_e$) period.
$$CA_v = \sum (u \in \text{Users} \mid u.\text{role} = \text{"client"} \land t_s \le u.\text{createdAt} \le t_e)$$

### 3. Broker Network Completed Inspections ($BC_i$)
The total viewings/bookings completed by a Realtor ($r$) within a selected time duration.
$$BC_i(r) = \sum (b \in \text{Bookings} \mid b.\text{realtorId} = r \land b.\text{status} = \text{"completed"})$$

### 4. Application Incident Resolution Velocity ($IR_v$)
Tracks operations health by indicating resolved issues.
$$IR_v = \sum (i \in \text{Issues} \mid i.\text{status} = \text{"resolved"})$$

---

## 📈 Financial Safeguards
As transaction and escrow processing modules are not yet implemented:
*   **Total Transactions**: Static boundary returning `0`.
*   **Revenue Aggregate**: Set to `null`.
*   *UI Overlay Banner*: `"Financial analytics will become available when transaction data is connected."`
