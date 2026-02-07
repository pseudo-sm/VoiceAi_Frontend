# Report Filters Guide

This document explains how the Report page filter system is implemented in the frontend and how it maps to the backend API.

## Overview

The Report page (`src/components/report/Report.jsx`) uses the backend filter API:

```
POST https://telvi-voice-ai-fnfafecbhqa9edfp.centralindia-01.azurewebsites.net/reports/filter
```

Filters are applied from a right-side drawer that opens when the **Filters** button is clicked.

## Default Behavior

When the Report page loads:

- `end_date` is set to **today**
- `start_date` is set to **7 days back**
- The page fetches filtered data using those dates

## Filter UI → API Mapping

The UI fields map to API filters as follows:

| UI Field | API Field | Operator | Notes |
| --- | --- | --- | --- |
| Status | `status` | `=` | Exact match |
| Campaign Name | `campaign_name` | `LIKE` | Uses dropdown |
| Customer Name | `customer_name` | `LIKE` | Partial match |
| Email | `customer_email` | `LIKE` | Partial match |
| Phone | `customer_phone` | `LIKE` | Partial match |
| Transaction Type | `transaction_type` | `=` | `D` or `C` |
| Credit Min | `credit_spent` | `>=` | Number |
| Credit Max | `credit_spent` | `<=` | Number |
| Start/End Date | `start_date_time` | `BETWEEN` | `YYYY-MM-DDT00:00:00` → `YYYY-MM-DDT23:59:59` |

Global search maps to:

```
search: "<value>"
```

## Sorting

Sorting is triggered by clicking the arrow icon in a table header. The following fields are supported:

- `campaign_name`
- `narrative_name`
- `call_duration`
- `start_date_time`
- `credit_spent`

When a header is clicked, the frontend toggles `order` between `asc` and `desc`, and sends:

```
sort_by: "<field>"
order: "asc" | "desc"
```

## Pagination

Pagination uses:

```
page: <number>
page_size: <number>
```

The API response should include:

```
page
page_size
total_records
data
```

The UI uses `total_records` to compute total pages and enable/disable next/prev actions.

## Example Payload

```json
{
  "filters": [
    { "field": "status", "operator": "=", "value": "Success" },
    { "field": "credit_spent", "operator": ">=", "value": 2 },
    {
      "field": "start_date_time",
      "operator": "BETWEEN",
      "value_from": "2026-02-01T00:00:00",
      "value_to": "2026-02-08T23:59:59"
    }
  ],
  "search": "Paresh",
  "page": 1,
  "page_size": 10,
  "sort_by": "credit_spent",
  "order": "desc"
}
```

## Files

- UI + logic: `src/components/report/Report.jsx`
- Styles: `src/components/report/Report.css`


