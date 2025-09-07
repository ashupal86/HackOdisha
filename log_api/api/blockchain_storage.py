import threading
import os
from web3 import Web3
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class BlockchainStorage:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider("https://polygon-rpc.com"))
        self.contract_address = "0x35CFAB2Af75977A740049bB9a0E6886d3959BedB"
        self.contract_abi = [
            {
                "anonymous": False,
                "inputs": [
                    {
                        "indexed": True,
                        "internalType": "uint256",
                        "name": "logId",
                        "type": "uint256"
                    },
                    {
                        "indexed": False,
                        "internalType": "string",
                        "name": "logHash",
                        "type": "string"
                    },
                    {
                        "indexed": False,
                        "internalType": "string",
                        "name": "prevHash",
                        "type": "string"
                    },
                    {
                        "indexed": True,
                        "internalType": "address",
                        "name": "sender",
                        "type": "address"
                    }
                ],
                "name": "LogStored",
                "type": "event"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "logHash",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "prevHash",
                        "type": "string"
                    }
                ],
                "name": "storeLog",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "index",
                        "type": "uint256"
                    }
                ],
                "name": "getLog",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    },
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
                "name": "getLogCount",
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
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "logs",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "logHash",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "prevHash",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "sender",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ]
        
        self.contract = self.w3.eth.contract(address=self.contract_address, abi=self.contract_abi)
        self.private_key = os.getenv("PRIVATE_KEY")
        self.account = self.w3.eth.account.from_key(self.private_key)
        self._last_hash_lock = threading.Lock()
        self._last_hash = None
        
        self._nonce_lock = threading.Lock()
        self._current_nonce = None
        
    def get_last_blockchain_hash(self) -> str:
        try:
            log_count = self.contract.functions.getLogCount().call()
            if log_count == 0:
                return "0x0"
            
            last_log = self.contract.functions.getLog(log_count - 1).call()
            return last_log[0]
        except Exception as e:
            print(f"Error getting last blockchain hash: {e}")
            return "0x0"
    
    def get_next_nonce(self) -> int:
        """Get next nonce for transaction, managing it like your logchain_client.py"""
        with self._nonce_lock:
            self._current_nonce = self.w3.eth.get_transaction_count(self.account.address)
            
            nonce = self._current_nonce
            self._current_nonce += 1
            return nonce
    
    def store_log_hash(self, current_hash: str) -> Optional[str]:
        try:
            with self._last_hash_lock:
                if self._last_hash is None:
                    self._last_hash = self.get_last_blockchain_hash()
                
                prev_hash = self._last_hash
                
                
                txn = self.contract.functions.storeLog(current_hash, prev_hash).build_transaction({
                    'from': self.account.address,
                    'nonce': self.get_next_nonce(),
                    'gas': 500000,
                    'gasPrice': self.w3.eth.gas_price,
                })
                
                signed_txn = self.w3.eth.account.sign_transaction(txn, private_key=self.private_key)
                tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
                
                print(f"Stored log: {current_hash} (prev: {prev_hash}), tx = {tx_hash.hex()}")
                
                self._last_hash = current_hash
                
                return tx_hash.hex()
                
        except Exception as e:
            print(f"Error storing log on blockchain: {e}")
            return None

blockchain_storage = BlockchainStorage()

def store_log_on_blockchain_background(log_hash: str):
    try:
        result = blockchain_storage.store_log_hash(log_hash)
        if result:
            print(f"Successfully stored on blockchain: {result}")
        else:
            print(f"Failed to store hash {log_hash} on blockchain")
    except Exception as e:
        print(f"Background blockchain storage error: {e}")