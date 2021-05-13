import { Pos } from './parse';

type LiteralTypeCtor<T, V> = { type: T, value: V, pos: Pos };
export type AtomLiteral = LiteralTypeCtor<'atom', string>;
export type SymbolLiteral = LiteralTypeCtor<'symbol', string>;
export type ListLiteral = LiteralTypeCtor<'list', Literal[]>;
export type VectorLiteral = LiteralTypeCtor<'vector', Literal[]>;
export type NumberLiteral = LiteralTypeCtor<'number', number>;
export type StringLiteral = LiteralTypeCtor<'string', string>;
export type EllipsisLiteral = LiteralTypeCtor<'ellipsis', unknown>;
export type Literal = AtomLiteral | SymbolLiteral | ListLiteral | VectorLiteral | NumberLiteral | StringLiteral | EllipsisLiteral;
