// type ABITable struct {
// 	Name      string   `json:"name"`
// 	Type      string   `json:"type"`
// 	IndexType string   `json:"index_type"`
// 	KeyNames  []string `json:"key_names"`
// 	KeyTypes  []string `json:"key_types"`
// }

import { ConstructorDef } from "../contract/elementdef";

export class ABITable {
	name: string="";
	type: string="";
	index_type: string="";
	key_names: string[] = [];
	key_types: string[] = [];
}

// type ABIAction struct {
// 	Name              string `json:"name"`
// 	Type              string `json:"type"`
// 	RicardianContract string `json:"ricardian_contract"`
// }
export class ABIAction {
	name: string="";
	type: string="";
	ricardian_contract: string = "";

	constructor(name: string, type: string, ricardian_contract: string = "") {
		this.name = name;
		this.type = type;
		this.ricardian_contract = ricardian_contract;
	}
}

// type ABIStructField struct {
// 	Name string `json:"name"`
// 	Type string `json:"type"`
// }

export class ABIStructField {
	name: string = "";
	type: string = "";
}

// type ABIStruct struct {
// 	Name   string           `json:"name"`
// 	Base   string           `json:"base"`
// 	Fields []ABIStructField `json:"fields"`
// }
export class ABIStruct {
	name: string="";
	base: string="";
	fields: ABIStructField[] = [];
}

// type ABI struct {
// 	Version          string      `json:"version"`
// 	Structs          []ABIStruct `json:"structs"`
// 	Types            []string    `json:"types"`
// 	Actions          []ABIAction `json:"actions"`
// 	Tables           []ABITable  `json:"tables"`
// 	RicardianClauses []string    `json:"ricardian_clauses"`
// 	Variants         []string    `json:"variants"`
// 	AbiExtensions    []string    `json:"abi_extensions"`
// 	ErrorMessages    []string    `json:"error_messages"`
// }

export class ABI {
	version: string = "eosio::abi/1.1";
	structs: ABIStruct[] = [];
	types: string[] = [];
	actions: ABIAction[] = [];
	tables: ABITable[] = [];
	ricardian_clauses: string[] = [];
	variants: string[] = [];
	abi_extensions: string[] = [];
	error_messages: string[] = [];
}
