// type ABITable struct {
// 	Name      string   `json:"name"`
// 	Type      string   `json:"type"`
// 	IndexType string   `json:"index_type"`
// 	KeyNames  []string `json:"key_names"`
// 	KeyTypes  []string `json:"key_types"`
// }

export class ABITable {
	name = "";
	type = "";
	index_type = "";
	key_names: string[] = [];
	key_types: string[] = [];
}

// type ABIAction struct {
// 	Name              string `json:"name"`
// 	Type              string `json:"type"`
// 	RicardianContract string `json:"ricardian_contract"`
// }
export class ABIAction {
	constructor(
		public name: string = "",
		public type: string = "",
		public ricardian_contract = ""
	) {}
}

// type ABIStructField struct {
// 	Name string `json:"name"`
// 	Type string `json:"type"`
// }

export class ABIStructField {
	name = "";
	type = "";
}

// type ABIStruct struct {
// 	Name   string           `json:"name"`
// 	Base   string           `json:"base"`
// 	Fields []ABIStructField `json:"fields"`
// }
export class ABIStruct {
	name = "";
	base = "";
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

export class VariantDef {
	name = "";
	types: string[] = [];
}

export class ABIActionResult {
	constructor(
		public name: string = "",
		public result_type: string = ""
	) {}
}

export class ABI {
	version = "eosio::abi/1.2";
	structs: ABIStruct[] = [];
	types: string[] = [];
	actions: ABIAction[] = [];
	tables: ABITable[] = [];
	ricardian_clauses: string[] = [];
	variants: VariantDef[] = [];
	action_results: ABIActionResult[] = [];
	abi_extensions: string[] = [];
	error_messages: string[] = [];
}
