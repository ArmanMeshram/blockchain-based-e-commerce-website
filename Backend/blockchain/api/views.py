from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import viewsets,generics,status
from user.serializer import UserSerializer,ProductSerializer,Order_ItemsSerializer,Payment_DetailsSerializer,Order_DetailsSerializer
from user.models import User,Product,Order_Items,Payment_Details,Order_Details
from product.models import Cart,Shipping_Address,Track_Repairs,NFT_Details
from product.serializer import CartSerializer,Shipping_AddressSerializer,Track_RepairsSerializer,NFT_DetailsSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from home.permissions import IsAdmin, IsCustomer
from rest_framework.response import Response
from django.db.models import F
import random,requests,json
from web3 import Web3, HTTPProvider
from web3.gas_strategies.rpc import rpc_gas_price_strategy
from datetime import datetime, timedelta,timezone
try:
    from web3.middleware import ExtraDataToPOAMiddleware as geth_poa_middleware
except ImportError:  # Web3.py 5.x compatibility for the existing local environment.
    from web3.middleware import geth_poa_middleware
from dateutil import relativedelta
from django.core.mail import send_mail
from django.conf import settings
import re

@api_view(['GET'])
@permission_classes([IsCustomer])
def user_detail(request,id):
    try:
        user = User.objects.get(pk=id)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def product_list(request):
    product = Product.objects.all().order_by('name')
    serializer = ProductSerializer(product,many=True)
    return JsonResponse(serializer.data,safe=False)

@api_view(['POST'])
@permission_classes([IsAdmin])
def AddProduct(request,id):
    request.data['user_id'] = id
    serializer=ProductSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data,status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail(request,id):
    try:
        product = Product.objects.get(pk=id)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = ProductSerializer(product)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAdmin])
def update_product_detail(request,rid,pid):
    try:
        product = Product.objects.get(pk=pid)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    request.data['user_id'] = rid
    serializer = ProductSerializer(product,data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAdmin])
def delete_product(request,id):
    try:
        product = Product.objects.get(pk=id)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    product.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsCustomer])
def cart_list(request,id):
    try:
        cart = Cart.objects.filter(user_id=id)
    except Cart.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    serializer = CartSerializer(cart,many=True)
    ls = []
    total = 0
    print(serializer.data)
    for i in serializer.data:
        dict1 = {}
        product = Product.objects.get(id=i['product_id'])
        dict1['id'] = i['id']
        dict1['date_added'] = i['date_added']
        dict1['product_id'] = i['product_id']
        dict1['user_id'] = i['user_id']
        dict1['name'] = product.name
        dict1['price'] = product.price
        dict1['image'] = product.image.url if product.image else ''
        dict1['quantity'] = i['quantity']
        dict1['total_amount'] = i['total_amount']
        dict1['inCart'] = True
        ls.append(dict1)
    return Response(ls)

@api_view(['GET'])
@permission_classes([IsCustomer])
def total_cart_price(request,id):
    try:
        cart = Cart.objects.filter(user_id=id)
    except Cart.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    serializer = CartSerializer(cart,many=True)
    ls = []
    total = 0
    print(serializer.data)
    for i in serializer.data:
        dict1 = {}
        product = Product.objects.get(id=i['product_id'])
        dict1['id'] = i['id']
        dict1['date_added'] = i['date_added']
        dict1['product_id'] = i['product_id']
        dict1['user_id'] = i['user_id']
        dict1['name'] = product.name
        dict1['price'] = product.price
        dict1['quantity'] = i['quantity']
        dict1['total_amount'] = i['total_amount']
        total+=i['total_amount']
        ls.append(dict1)
    final = []
    dict2={'total':total}
    final.append(dict2)
    return Response(final)

@api_view(['DELETE'])
@permission_classes([IsCustomer])
def remove_item(request,uid,pid):
    try:
        cart = Cart.objects.filter(user_id = uid,product_id=pid)
    except Cart.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    cart.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsCustomer])
def AddItem(request,uid,pid):
    try:
        cart = Cart.objects.get(user_id=uid, product_id=pid)
        cart.quantity += 1
        cart.total_amount = cart.quantity * cart.product_id.price
        cart.save(update_fields=['quantity', 'total_amount'])
    except Cart.DoesNotExist:
        product = Product.objects.get(pk=pid)
        cart = Cart.objects.create(user_id_id=uid, product_id=product, quantity=1, total_amount=product.price)
    return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsCustomer])
def clear_cart(request,id):
    try:
        cart = Cart.objects.filter(user_id=id)
    except Cart.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    cart.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
@permission_classes([IsCustomer])
def update_quant_and_total(request,uid,pid):
    try:
        cart = Cart.objects.get(user_id=uid, product_id=pid)
    except Cart.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    cart.quantity += 1
    cart.total_amount = cart.quantity * cart.product_id.price
    cart.save(update_fields=['quantity', 'total_amount'])
    return Response(CartSerializer(cart).data)

@api_view(['PUT'])
@permission_classes([IsCustomer])
def dec_quant_and_total(request,uid,pid):
    try:
        cart = Cart.objects.get(user_id=uid, product_id=pid)
    except Cart.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    cart.quantity = max(1, cart.quantity - 1)
    cart.total_amount = cart.quantity * cart.product_id.price
    cart.save(update_fields=['quantity', 'total_amount'])
    return Response(CartSerializer(cart).data)

@api_view(['GET'])
@permission_classes([IsCustomer])
def order_items(request,id):
    order = Order_Items.objects.filter(user_id=id)
    serializer = Order_ItemsSerializer(order,many=True)
    ls = []
    for i in serializer.data:
        dict1 = {}
        product = Product.objects.get(id=i['product_id'])
        dict1['id'] = i['id']
        dict1['user_id'] = i['user_id']
        dict1['order_date'] = i['order_date']
        dict1['name'] = product.name
        dict1['price'] = product.price*i['quantity']
        dict1['quantity'] = i['quantity']
        ls.append(dict1)
    return Response(ls)

@api_view(['POST'])
@permission_classes([IsCustomer])
def AddOrder(request,id):
    try:
        cart = Cart.objects.filter(user_id=id)
        order = Order_Items.objects.filter(user_id=id)
    except Cart.DoesNotExist or Order_Items.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    order.delete()
    serializer = CartSerializer(cart,many=True)
    ls = []
    for i in serializer.data:
        dict1 = {}
        dict1['product_id'] = i['product_id']
        dict1['user_id'] = i['user_id']
        dict1['quantity'] = i['quantity']
        ls.append(dict1)
    for i in range(len(ls)):
        request.data['user_id'] = ls[i]['user_id']
        request.data['product_id'] = ls[i]['product_id']
        request.data['quantity'] = ls[i]['quantity']
        print(request.data)
        serializer=Order_ItemsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
    return Response(ls)

@api_view(['DELETE'])
@permission_classes([IsCustomer])
def cancel_order(request,id):
    try:
        order = Order_Items.objects.filter(user_id=id)
    except Order_Items.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    order.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsCustomer])
def ship_address(request,id):
    try:
        ship = Shipping_Address.objects.filter(user_id=id)
        order = Order_Items.objects.filter(user_id=id)
        ship.delete()
    except Order_Items.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    request.data['user_id'] = id
    serializer = Shipping_AddressSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsCustomer])
def order_details(request,id):
    request.data['payment_id']=id
    serializer=Order_DetailsSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data,status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsCustomer])
def pinata_file_upload(request,uid,id):
    if not settings.PINATA_JWT or not settings.POLYGON_RPC_URL or not settings.CONTRACT_ADDRESS or not settings.CONTRACT_OWNER_PRIVATE_KEY:
        return Response({'detail': 'NFT minting is not configured. Set Pinata, Polygon RPC, contract address, and contract owner key in Backend/blockchain/.env.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    try:
        w3 = Web3(HTTPProvider(settings.POLYGON_RPC_URL))
        if not w3.is_connected():
            raise ValueError('The configured Polygon RPC endpoint is unavailable.')
        if int(w3.eth.chain_id) != int(settings.CONTRACT_CHAIN_ID):
            raise ValueError('The configured RPC network does not match CONTRACT_CHAIN_ID.')
        w3.middleware_onion.inject(geth_poa_middleware, layer=0)
    except Exception as exc:
        return Response({'detail': 'Polygon RPC is unavailable or configured for the wrong chain: {}'.format(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    oorder = Order_Items.objects.filter(user_id=uid)
    oserializer = Order_ItemsSerializer(oorder,many=True)
    ls = []
    for i in oserializer.data:
        dicto = {}
        product = Product.objects.get(id=i['product_id'])
        dicto['id'] = i['id']
        dicto['product_id'] = i['product_id']
        dicto['user_id'] = i['user_id']
        dicto['order_date'] = i['order_date']
        dicto['name'] = product.name
        dicto['price'] = product.price*i['quantity']
        dicto['quantity'] = i['quantity']
        ls.append(dicto)
    final = {}
    try1 = []
    for i in ls:
        print('outer')
        finallist = []
        try2 = {}
        for j in range(i['quantity']):
            print('inner')
            product = Product.objects.filter(pk=i['product_id'])
            serializer = ProductSerializer(product,many=True)
            img_name = serializer.data[0]['image'].split('/')[-1]
            file_path = product.image.path
            url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
            payload={}
            files=[
              ('file',(img_name,open(file_path,'rb'),'image/png'))
            ]
            headers = {
              'Authorization': 'Bearer ' + settings.PINATA_JWT
            }

            response = requests.post(url, headers=headers, data=payload, files=files, timeout=60)
            response.raise_for_status()
            hashval = response.json()['IpfsHash']
            url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
            img_url = "https://blockfinch.mypinata.cloud/ipfs/"+ hashval
            Product_name = serializer.data[0]['name']
            time = serializer.data[0]['warranty_period']*31556952
            x = datetime.now() + timedelta(seconds=time)
            payload = json.dumps({
              "description": "Token URL Generation",
              "external_url": img_url,
              "image": img_url,
              "name": Product_name+"-Warranty NFT",
              "attributes": [
                {
                  "trait_type": "Expiry",
                  "value": str(x)
                }
              ]
            })
            headers = {
              'Authorization': 'Bearer ' + settings.PINATA_JWT,
              'Content-Type': 'application/json'
            }

            response = requests.post(url, headers=headers, data=payload, timeout=60)
            response.raise_for_status()
            hashval2 = response.json()['IpfsHash']
            json_url = "https://blockfinch.mypinata.cloud/ipfs/"+ hashval2
            abi = '''[
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "approved",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "operator",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "approved",
                "type": "bool"
            }
        ],
        "name": "ApprovalForAll",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tid",
                "type": "uint256"
            }
        ],
        "name": "applyExpiryDiscount",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "getApproved",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "startwarr",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "warrPeriod",
                "type": "uint256"
            }
        ],
        "name": "getTime",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "operator",
                "type": "address"
            }
        ],
        "name": "isApprovedForAll",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "ownerOf",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tid",
                "type": "uint256"
            }
        ],
        "name": "replacement",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "warrantyDuration",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "uri",
                "type": "string"
            }
        ],
        "name": "safeMint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "operator",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "approved",
                "type": "bool"
            }
        ],
        "name": "setApprovalForAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes4",
                "name": "interfaceId",
                "type": "bytes4"
            }
        ],
        "name": "supportsInterface",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "tokenURI",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tid",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tid",
                "type": "uint256"
            }
        ],
        "name": "warrantyProvider",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]'''
        
            greeter = w3.eth.contract(
                address=Web3.to_checksum_address(settings.CONTRACT_ADDRESS),
                #"0xb681e8FC1c9E6DBefcF9504a43b634D306c10B7C",
                abi=abi)
            account_from = {
                'private_key': settings.CONTRACT_OWNER_PRIVATE_KEY,
            }
            account_factory = w3.eth.account
            account = account_factory.from_key(account_from['private_key']) if hasattr(account_factory, 'from_key') else account_factory.privateKeyToAccount(account_from['private_key'])
            account_from['address'] = account.address
            address_to=id
            # address_to = request.POST.get("to_add")
            print(address_to)
            token_id = random.randint(100000000000000,999999999999999)
           
            checksum_address = Web3.to_checksum_address(address_to) if hasattr(Web3, 'to_checksum_address') else Web3.toChecksumAddress(address_to)
            mint_function = greeter.functions.safeMint(checksum_address,token_id,time,json_url)
            tx_builder = mint_function.build_transaction if hasattr(mint_function, 'build_transaction') else mint_function.buildTransaction
            reset_tx = tx_builder(
            {
                'from': account_from['address'],
                'nonce': w3.eth.get_transaction_count(account_from['address']),
            }
            )
            tx_create = w3.eth.account.sign_transaction(reset_tx, account_from['private_key'])
            signed_raw_transaction = tx_create.raw_transaction if hasattr(tx_create, 'raw_transaction') else tx_create.rawTransaction
            tx_hash = w3.eth.send_raw_transaction(signed_raw_transaction)
            tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            
            request.data['product_id'] = i['product_id']
            request.data['token_url'] = json_url
            request.data['expiry_date'] = x
            request.data['token_id'] = token_id
            request.data['user_id'] = uid
            request.data['acc_address'] = address_to
            serializer=NFT_DetailsSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                try2[str(token_id)] = str(tx_receipt.transactionHash.hex())
                print(tx_receipt.transactionHash.hex())
                finallist.append(str(tx_receipt.transactionHash.hex()))
            #try2[str(i['product_id'])] = finallist
        try1.append(try2)
        final[str(i['product_id'])]=finallist
    subject = 'Warranty Receipt'
    message = ""
    for ele in try1:
        message += json.dumps(ele)
        print(message)
        message+= "\n"
    try:
        user = User.objects.get(pk=uid)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    serializer = UserSerializer(user)
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [serializer.data['email'],]
    message = re.sub(r"[\([{})\]]", "", message)
    message = '\n'.join(message.split(','))
    msg2 = '''Your transaction is successful. Below are the respective token ids and hash values of the purchased products. You can verify these transactions on Polygon Amoy at https://amoy.polygonscan.com/.'''
    final_msg = msg2+'\n\n'+message+'\n'+'Regards'+'\n'+'From FlipKart-Grid Team'
    send_mail( subject, final_msg, email_from, recipient_list )
    return Response(try1)

@api_view(['GET'])
@permission_classes([IsCustomer])
def valid_nft(request,id):
    try:
        nft = NFT_Details.objects.filter(user_id=id)
    except NFT_Details.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    serializer = NFT_DetailsSerializer(nft,many=True)
    ls = []
    for i in serializer.data:
        d = datetime.fromisoformat(i['expiry_date'][:-1]).astimezone(timezone.utc)
        exp_date = d.strftime('%Y-%m-%d %H:%M:%S.%f')
        exp_date = datetime.strptime(exp_date,'%Y-%m-%d %H:%M:%S.%f')
        d1 = datetime.strptime(str(datetime.now().date()), "%Y-%m-%d")
        d2 = datetime.strptime(str(exp_date.date()), "%Y-%m-%d")
        z = relativedelta.relativedelta(d2,d1)
        dict1 = {}
        product = Product.objects.get(id=i['product_id'])
        serializer1 = ProductSerializer(product)
        dict1['id'] = i['id']
        dict1['token_url'] = i['token_url']
        dict1['expiry_date'] = exp_date.date()
        dict1['token_id'] = i['token_id']
        dict1['user_id'] = i['user_id']
        dict1['product_id'] = i['product_id']
        dict1['name'] = serializer1.data['name']
        dict1['image'] = serializer1.data['image']
        dict1['acc_address'] = i['acc_address']
        dict1['diff'] = str(z.years)+'Years,'+str(z.months)+'months,'+ str(z.days)+ 'days'
        dict1['redeem'] = i['redeem']
        ls.append(dict1)
    return Response(ls)

@api_view(['PUT'])
@permission_classes([IsCustomer])
def update_nft_detail(request,tid,uname,id):
    try:
        nft = NFT_Details.objects.get(token_id=tid)
    except NFT_Details.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    user = User.objects.get(username=uname)
    request.data['user_id'] = user.id
    request.data['acc_address'] = id
    serializer = NFT_DetailsSerializer(nft,data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsCustomer])
def update_warranty(request,tid):
    try:
        nft = NFT_Details.objects.filter(token_id=tid)
    except NFT_Details.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    add = tid%10
    serializer1 = NFT_DetailsSerializer(nft,many=True)
    ans = serializer1.data[0]['expiry_date']
    d = datetime.fromisoformat(ans[:-1]).astimezone(timezone.utc)
    ans1 = d.strftime('%Y-%m-%d %H:%M:%S.%f')
    new_date = datetime.strptime(ans1,'%Y-%m-%d %H:%M:%S.%f')
    final = new_date+relativedelta.relativedelta(months=add)
    nft1 = NFT_Details.objects.get(id=serializer1.data[0]['id'])
    request.data['expiry_date'] = final
    serializer = NFT_DetailsSerializer(nft1,data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsCustomer])
def update_redeem(request,tid):
    try:
        nft = NFT_Details.objects.get(token_id=tid)
    except NFT_Details.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    request.data['redeem'] = False
    serializer = NFT_DetailsSerializer(nft,data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

