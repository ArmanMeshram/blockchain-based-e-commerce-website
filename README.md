# Blockchain Based Ecommerce Application

A React and Django ecommerce application that uses an ERC-721 contract to record product ownership and warranty activity. Users can browse and purchase products, while blockchain transactions support ownership transfers and warranty features.

## Project structure

```text
Backend/blockchain/       Django API, migrations, and settings
Blockchain-Contract/      Solidity contract source
Frontend/                 React application and contract ABI
AUTH_SETUP.md             Authentication and role-based access setup
```

## Prerequisites

- Node.js and npm
- Python 3.8 recommended for this project's pinned Django 2.2 dependencies
- Ganache for local blockchain development, or access to a network supported by MetaMask
- MetaMask browser extension for wallet transactions
- Remix IDE or another Solidity development environment for deploying the contract

## Backend setup

From the repository root, create and activate a virtual environment, then install the backend dependencies:

```bash
cd Backend/blockchain
python -m venv .venv
```

Activate it in PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Or on macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies, prepare a fresh local database, and create an administrator account:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API is available at `http://localhost:8000`. The SQLite database and uploaded product images are local data and are not committed. For local development, Django has safe development defaults. To customize settings, copy `.env.example` to `.env` and set `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, and `DJANGO_ALLOWED_HOSTS` in the process environment before starting Django. The settings module reads environment variables directly; it does not load `.env` files automatically. Use a new secret key and `DJANGO_DEBUG=False` in deployment.

## Frontend setup

In another terminal, from the repository root:

```bash
cd Frontend
npm install
```

Copy `.env.example` to `.env`, set `CONTRACT_ADDRESS` to the deployed contract address, then start the development server:

```bash
npm start
```

The frontend runs at `http://localhost:3000`. Its API defaults to `http://localhost:8000`.

## Deploying the contract

1. Open `Blockchain-Contract/FlipkartGrid.sol` in Remix IDE or your Solidity toolchain and compile it with a compatible Solidity 0.8.x compiler and OpenZeppelin Contracts 4.7.0.
2. Connect MetaMask to the target network (Ganache for local development) and deploy `FlipkartGrid` using the deployer wallet.
3. Copy the deployed contract address into `Frontend/.env` as `CONTRACT_ADDRESS=0x...`.

The current frontend contract calls still use a hard-coded address in `Frontend/src/components/NFTDetails.js`; setting `CONTRACT_ADDRESS` alone does not change the address used by those calls. Update that address there to match the deployment when using a different contract. The ABI is in `Frontend/src/Contract.json`.

## Authentication

See [AUTH_SETUP.md](AUTH_SETUP.md) for authentication and role-based access details.

## Screenshots

![Ecommerce home page](https://user-images.githubusercontent.com/60435967/187740415-ec77d76a-9011-4841-b36c-8aece8dca27a.png)

![Cart](https://user-images.githubusercontent.com/60435967/187740441-5c1ec5c3-e4fb-4b50-8861-f4c27c60692b.png)
