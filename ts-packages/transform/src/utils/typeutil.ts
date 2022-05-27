import { CONFIG } from "../config/compile";
import { FieldDef } from "../contract/elementdef";
import { TypeKindEnum } from "../enums/customtype";
import { Strings } from "./primitiveutil";
import { AstUtil } from "./utils";

export class TypeHelper {

    static codecTypes = ["Int8", "Int16", "Int32", "Int64", "Int128", "UInt8", "UInt16", "UInt32", "UInt64"];

    static nativeType = ["i8", "i16", "i32", "i64", "u8", "u16", "u32", "u64", "boolean"];

    static bigNumType = ["u128", "i128", "u256"];

    static bigNumCodecType = ["UInt128", "Int128"];

    static primitiveToCodecMap: Map<string, string> = new Map([
        ["i8", "Int8"],
        ["i16", "Int16"],
        ["i32", "Int32"],
        ["i64", "Int64"],
        ["i128", "Int128"],
        ["u8", "UInt8"],
        ["u16", "UInt16"],
        ["u32", "UInt32"],
        ["u64", "UInt64"],
        ["u128", "UInt128"],
        ["bool", "Bool"],
        ["boolean", "Bool"],
        ["string", "ScaleString"],
        ["String", "ScaleString"],
        ["Array", "ScaleArray"],
        ["Map", "ScaleMap"]
    ]);

    /**
     * If the type is [], rename the array type to 'Array'
     * @param name 
     * @returns 
     */
    static renameArrayType(name: string): string {
        if (name.replace(/ /g, "") == `[]`) {
            return 'Array';
        }
        return name;
    }

    static primitiveToAbiMap: Map<string, string> = new Map([
        ["bool", "bool"],
        ["boolean", "bool"],
        ["i8", "int8"],
        ["u8", "uint8"],
        ["i16", "int16"],
        ["u16", "uint16"],
        ["i32", "int32"],
        ["u32", "uint32"],
        ["usize", "uint32"],
        ["i64", "int64"],
        ["u64", "uint64"],
        
        ["f32", "float32"],
        ["f64", "float64"],
        
        ["u8[]", "bytes"],
        ["string", "string"],

        ["I128", "int128"],
        ["U128", "uint128"],
        ["VarInt32", "varint32"],
        ["VarUint32", "varuint32"],
        ["Float128", "float128"],        
        ["TimePoint", "time_point"],
        ["TimePointSec", "time_point_sec"],
        ["BlockTimestampType", "block_timestamp_type"],        
        ["Name", "name"],
        
        ["Checksum160", "checksum160"],
        ["Checksum256", "checksum256"],
        ["U256", "checksum256"],
        ["Checksum512", "checksum512"],
        ["PublicKey", "public_key"],
        ["Signature", "signature"],
        ["Symbol", "symbol"],
        ["SymbolCode", "symbol_code"],
        ["Asset", "asset"],
        ["ExtendedAsset", "extended_asset"],

        ["chain.I128", "int128"],
        ["chain.U128", "uint128"],
        ["chain.VarInt32", "varint32"],
        ["chain.VarUint32", "varuint32"],
        ["chain.Float128", "float128"],        
        ["chain.TimePoint", "time_point"],
        ["chain.TimePointSec", "time_point_sec"],
        ["chain.BlockTimestampType", "block_timestamp_type"],        
        ["chain.Name", "name"],
        
        ["chain.Checksum160", "checksum160"],
        ["chain.Checksum256", "checksum256"],
        ["chain.U256", "checksum256"],
        ["chain.Checksum512", "checksum512"],
        ["chain.PublicKey", "public_key"],
        ["chain.Signature", "signature"],
        ["chain.Symbol", "symbol"],
        ["chain.SymbolCode", "symbol_code"],
        ["chain.Asset", "asset"],
        ["chain.ExtendedAsset", "extended_asset"],
    ]);


    static codecToAbiMap: Map<string, string> = new Map([
        ["Int8", "i8"],
        ["Int16", "i16"],
        ["Int32", "i32"],
        ["Int64", "i64"],
        ["UInt8", "u8"],
        ["UInt16", "u16"],
        ["UInt32", "u32"],
        ["UInt64", "u64"],
        ["UInt128", "u128"],
        ["Int128", "i128"],
        ["Bool", "bool"],
        ["ScaleString", "str"],
        ["Array", "arr"],
        ["Map", "map"]
    ]);


    static getCodecType(asType: string): string {
        let type: string | undefined = TypeHelper.primitiveToCodecMap.get(asType);
        return type == undefined ? asType : type;
    }

    static getAbiType(asType: string): string {
        let type: string | undefined = TypeHelper.primitiveToAbiMap.get(asType);
        if (!type) {
            type = TypeHelper.codecToAbiMap.get(asType);
        }
        return type == undefined ? Strings.EMPTY : type;
    }

    /**
     * Is primitive type
     * @param type 
     * @returns 
     */
    static isPrimitiveType(type: TypeKindEnum): boolean {
        return type == TypeKindEnum.NUMBER
            || type == TypeKindEnum.STRING;
    }

    static isNumberType(type: TypeKindEnum): boolean {
        return type == TypeKindEnum.NUMBER;
    }

    static isStringType(type: TypeKindEnum): boolean {
        return type == TypeKindEnum.STRING;
    }

    static isUserClassType(type: TypeKindEnum): boolean {
        return type == TypeKindEnum.USER_CLASS;
    }

    /**
     * Get the type kind that is not code type.
     * @param typeName 
     * @returns 
     */
    static getTypeKindFromUnCodec(typeName: string): TypeKindEnum | null {
        if (typeName == "void") {
            return TypeKindEnum.VOID;
        }
        if (Strings.isString(typeName)) {
            return TypeKindEnum.STRING;
        }
        if (TypeHelper.nativeType.includes(typeName)) {
            return TypeKindEnum.NUMBER;
        }
        return null;
    }


    /**
     * Get type by name
     * @param typeName 
     * @returns 
     */
    static getTypeKindByName(typeName: string): TypeKindEnum {
        if (typeName == "void") {
            return TypeKindEnum.VOID;
        }
        if (Strings.isString(typeName)) {
            return TypeKindEnum.STRING;
        }
        if (AstUtil.isArrayType(typeName)) {
            return TypeKindEnum.ARRAY;
        }
        if (AstUtil.isMapType(typeName)) {
            return TypeKindEnum.MAP;
        }
        if (TypeHelper.nativeType.includes(typeName)) {
            return TypeKindEnum.NUMBER;
        } 

        if (TypeHelper.codecTypes.includes(typeName)) {
            return TypeKindEnum.NUMBER;
        }
        
        if (TypeHelper.bigNumType.includes(typeName)) {
            return TypeKindEnum.BIG_NUM;
        }
    
        if (TypeHelper.bigNumCodecType.includes(typeName)) {
            return TypeKindEnum.BIG_NUM;
        }

        return TypeKindEnum.USER_CLASS;
    }
}


export class FieldDefHelper {

    /**
     * Get the storable array export
     * @param field 
     * @returns 
     */
    static getConcreteStorable(field: FieldDef): string {
        // let typeArgs = field.type.typeArguments.map(item => item.codecType).join(",");
        // let plainType = field.type.plainType;
        // let arrayType = field.decorators.isPacked ? "Packed" : "Spread" ;
        // let arrayType = "";
        let plainVarious = `${CONFIG.scope}${field.type.plainTypeNode}`;
        return plainVarious;
    }

    /**
     * Get the storable array export
     * @param field 
     * @returns 
     */
    static getStorableExport(field: FieldDef): string {
        let typeArgs = field.type.typeArguments.map(item => item.codecType).join(",");
        let plainVarious = `${field.type.getNameSpace()}${field.type.plainType}<${typeArgs}>`;
        return plainVarious;
    }
}
