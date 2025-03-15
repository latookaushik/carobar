# Carobar

## What is Carobar?

Carobar is a web application that allows car trading businesses to create and manage their car inventory. Built with NextJS 15 and PostgreSQL, it provides a user-friendly interface to manage purchases, sales, shipments, invoices, and accounts information.

## Setup and Installation

### Environment Variables

The application requires the following environment variables to be set:

| Variable              | Description                         | Required | Default                 |
| --------------------- | ----------------------------------- | -------- | ----------------------- |
| `DATABASE_URL`        | PostgreSQL connection string        | Yes      | -                       |
| `JWT_SECRET`          | Secret key for JWT token signing    | Yes      | -                       |
| `TOKEN_EXPIRY`        | JWT token expiration (e.g., '1h')   | No       | '1h'                    |
| `USE_HTTPS`           | Set to 'true' if serving over HTTPS | No       | -                       |
| `NEXT_PUBLIC_APP_URL` | Base URL for the application        | No       | 'http://localhost:3000' |

> **Important Security Note**: The `USE_HTTPS` variable determines how cookies are handled. When running in production:
>
> - If your site is served over HTTPS, set `USE_HTTPS=true`
> - If your site is served over HTTP, ensure `USE_HTTPS` is not set to 'true'
>
> This prevents authentication issues when cookies are set with the `secure` flag but accessed over HTTP.

### How to Setup a New Company

1. Companies need to request Admin to register their Company in the system as first step.
2. **Admin will Setup Company profile** and setup 1 user as Manager
   [ Unique company id, company name, address, phone number and email etc ]
3. Company Manager will do initial Reference data setup to start using the Application.

## Features Available for Company Manager & Staff

- **Contact Management**: Maintain business counterparties like Suppliers, Buyers, Shipment Agents, Repair companies, Local Transport service providers, etc.
- **Inventory Management**: Track and manage your vehicle inventory with detailed attributes
- **Business Process Management**: Handle Purchasing, Selling, Shipment, Repairs, managing stocklist, Vehicle attributes, Expenses & Taxes
- **Financial Management**:
  - Bank transactions
  - Journal Entries (Bank & Purchase are automated in the application)
- **Reporting**: Generate real-time reports for business analysis

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Development vs Production Considerations

When developing and testing in production mode, be aware of cookie handling differences:

- In development mode, cookie security is less strict
- In production mode, cookie security is enforced according to the `USE_HTTPS` setting
