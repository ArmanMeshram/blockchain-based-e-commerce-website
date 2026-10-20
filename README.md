# Blockchain Based Ecommerce Application

A full-stack ecommerce store with a React storefront, Django REST API, cart and order management, role-based seller tools, MetaMask wallet support, and Solidity NFT records for ownership and warranty activity.

## Project structure

```text
Backend/blockchain/       Django project, API, SQLite configuration, and media uploads
Frontend/                 React storefront, wallet integration, and contract ABI
Blockchain-Contract/      Solidity contract source
AUTH_SETUP.md             Authentication and role-based access setup
```

## Prerequisites

- Node.js 20.19+ or 22.12+ and npm
- Python 3.12+ (Python 3.14 is supported)
- MetaMask
- A Polygon Amoy RPC provider URL and API key for contract calls
- Remix IDE or another Solidity development environment to deploy the contract

The app is configured for Polygon Amoy (`chain ID 80002`). The old Mumbai test network is retired. MetaMask can still be used with a local Ganache network for local contract development, but the backend NFT mint flow expects an Amoy deployment and RPC endpoint.

## Backend setup

From the repository root, create and activate a virtual environment:

```powershell
cd Backend/blockchain
py -3.14 -m venv venv
.\venv\Scripts\Activate.ps1
```

On macOS/Linux, use `python3 -m venv venv` and `source venv/bin/activate` instead. Install packages and initialize the local database:

```shell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
Copy-Item .env.example .env   # PowerShell; copy .env.example .env on macOS/Linux
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API runs at `http://127.0.0.1:8000`. `.env` is read locally and ignored by Git. The development defaults work for browsing and basic API use. To mint warranty NFTs, set `PINATA_JWT`, `POLYGON_RPC_URL`, `CONTRACT_ADDRESS`, and `CONTRACT_OWNER_PRIVATE_KEY` in `Backend/blockchain/.env`. Use newly rotated credentials and a dedicated testnet deployer wallet. Never commit those values. If you do not configure them, the NFT mint endpoint reports that minting is unavailable while normal product/cart/order APIs remain usable.

`db.sqlite3` and uploaded media are local data and are not committed. On a fresh checkout, run migrations and create a superuser; add store inventory through the admin or seller tools.

## Frontend setup

In another terminal:

```powershell
cd Frontend
Copy-Item .env.example .env   # copy .env.example .env on macOS/Linux
npm install
npm start
```

The Vite development server runs at `http://127.0.0.1:3000`. The API URL defaults to `http://127.0.0.1:8000`. `Frontend/.env` accepts these optional values:

- `VITE_API_URL` — Django API base URL
- `VITE_CONTRACT_ADDRESS` — deployed Amoy contract address
- `VITE_CHAIN_ID=80002` — Polygon Amoy network ID
- `VITE_EXPLORER_URL=https://amoy.polygonscan.com` — transaction explorer
- `VITE_POLYGON_RPC_URL` — RPC URL MetaMask can use when adding the Amoy network

## Deploy the contract

1. Open `Blockchain-Contract/FlipkartGrid.sol` in Remix and compile with Solidity 0.8.x and OpenZeppelin Contracts 4.7.0 (as referenced in the source).
2. Connect MetaMask to Polygon Amoy and deploy `FlipkartGrid` from the wallet you will use as the contract owner.
3. Copy the deployed address to `Frontend/.env` as `VITE_CONTRACT_ADDRESS` and to `Backend/blockchain/.env` as `CONTRACT_ADDRESS`.
4. Configure the backend's `POLYGON_RPC_URL`, `PINATA_JWT`, and `CONTRACT_OWNER_PRIVATE_KEY`. Configure `VITE_POLYGON_RPC_URL` for MetaMask network setup.
5. Restart both development servers after changing environment values.

The contract ABI is in `Frontend/src/Contract.json`. The backend owner key is only used server-side to mint; never put it in frontend environment variables. Polygon Amoy RPC providers may change their endpoint policies, so use a current provider URL and key from your provider rather than a public RPC.

## MetaMask setup and checks

1. Install MetaMask from its official site, create or import a **new test wallet**, and switch to Polygon Amoy (`80002`). The storefront detects account and network changes; wallet actions switch to Amoy and stop if the wallet is on another chain.
2. Get test POL for gas on Amoy. Transactions cannot be sent from an unfunded wallet.
3. Deploy `FlipkartGrid.sol` to Amoy and set that deployment's address as `VITE_CONTRACT_ADDRESS` in `Frontend/.env` and `CONTRACT_ADDRESS` in `Backend/blockchain/.env`. The frontend and backend must point to the same Amoy deployment.
4. Set a working Amoy provider URL in both `VITE_POLYGON_RPC_URL` and `POLYGON_RPC_URL`. These values are provider endpoints and may include API keys; keep `.env` files private.
5. For backend NFT minting, configure a fresh Pinata JWT and a dedicated testnet owner key in the backend `.env`. The owner key must control the deployed contract, and must never be put in frontend settings.
6. Restart the frontend and backend after editing environment files. Connect MetaMask from the storefront, approve the site connection, and confirm the header shows the shortened account and `Amoy`.

The checked-in example files contain placeholders, not live deployment credentials. The app cannot submit NFT transactions until you deploy the contract and configure the matching address, RPC provider, and backend credentials. Do not reuse any credentials or wallet key that has previously been exposed in Git history.

## Authentication

See [AUTH_SETUP.md](AUTH_SETUP.md) for login, registration, and role-based access details.
