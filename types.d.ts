// Type definitions for node-sql-parser 1.0
// Project: https://github.com/taozhi8833998/node-sql-parser#readme
// Definitions by: taozhi8833998 <https://github.com/taozhi8833998>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.4

export interface With {
  name: { value: string };
  stmt: {
    _parentheses?: boolean;
    tableList: string[];
    columnList: string[];
    ast: Select;
  };
  columns?: ColumnRef[];
}
import { LocationRange } from "pegjs";

export { LocationRange, Location } from "pegjs";

export type WhilteListCheckMode = "table" | "column";
export interface ParseOptions {
  includeLocations?: boolean;
}
export interface Option {
  database?: string;
  type?: string;
  trimQuery?: boolean;
  parseOptions?: ParseOptions;
}
export interface TableColumnAst {
  tableList: string[];
  columnList: string[];
  ast: AST[] | AST;
  parentheses?: boolean;
  loc?: LocationRange;
}
export interface BaseFrom {
  db: string | null;
  table: string;
  as: string | null;
  schema?: string;
  addition?: boolean;
  loc?: LocationRange;
}
export interface Join extends BaseFrom {
  join: "INNER JOIN" | "LEFT JOIN" | "RIGHT JOIN";
  using?: string[];
  on?: Binary;
}
export interface TableExpr {
  expr: {
    tableList: string[];
    columnList: string[];
    ast: Select;
    parentheses: boolean;
  };
  as?: string | null;
}
export interface Dual {
  type: "dual";
  loc?: LocationRange;
}
export type From = BaseFrom | Join | TableExpr | Dual;
export interface LimitValue {
  type: string;
  value: number;
  loc?: LocationRange;
}
export interface Limit {
  seperator: string;
  value: LimitValue[];
  loc?: LocationRange;
}
export interface OrderBy {
  type: "ASC" | "DESC" | null;
  expr: ExpressionValue;
  loc?: LocationRange;
}

export interface ValueExpr<T = string | number | boolean> {
  type:
    | "backticks_quote_string"
    | "string"
    | "number"
    | "regex_string"
    | "hex_string"
    | "full_hex_string"
    | "natural_string"
    | "bit_string"
    | "double_quote_string"
    | "single_quote_string"
    | "boolean"
    | "bool"
    | "null"
    | "star"
    | "param"
    | "origin"
    | "date"
    | "datetime"
    | "default"
    | "time"
    | "timestamp"
    | "var_string";
  value: T;
}

export type SortDirection = 'ASC' | 'DESC' | 'asc' | 'desc';

export interface ColumnRefItem {
  type: "column_ref";
  table?: string | null;
  column: string | { expr: ValueExpr };
  options?: ExprList;
  loc?: LocationRange;
  collate?: CollateExpr | null;
  order_by?: SortDirection | null;
}
export interface ColumnRefExpr {
  type: "expr";
  expr: ColumnRefItem;
  as: string | null;
}

export type ColumnRef = ColumnRefItem | ColumnRefExpr;
export interface SetList {
  column: string;
  value: ExpressionValue;
  table: string | null;
  loc?: LocationRange;
}
export interface InsertReplaceValue {
  type: "expr_list";
  value: ExpressionValue[];
  prefix?: string | null;
  loc?: LocationRange;
}

export interface Star {
  type: "star";
  value: "*" | "";
  loc?: LocationRange;
}
export interface Case {
  type: "case";
  expr: null;
  args: Array<
    | {
        cond: Binary;
        result: ExpressionValue;
        type: "when";
      }
    | {
        result: ExpressionValue;
        type: "else";
      }
  >;
}
export interface Cast {
  type: "cast";
  keyword: "cast";
  expr: ExpressionValue;
  symbol: "as";
  target: {
    dataType: string;
    quoted?: string;
  }[];
}
export interface AggrFunc {
  type: "aggr_func";
  name: string;
  args: {
    expr: ExpressionValue;
    distinct?: "DISTINCT" | null;
    orderby?: OrderBy[] | null;
    parentheses?: boolean;
    separator?: string;
  };
  loc?: LocationRange;
  over?: { type: 'window'; as_window_specification: AsWindowSpec } | null;
}

export type FunctionName = {
  schema?: { value: string; type: string };
  name: ValueExpr<string>[];
};
export interface Function {
  type: "function";
  name: FunctionName;
  args?: ExprList;
  suffix?: OnUpdateCurrentTimestamp | null;
  over?: { type: 'window'; as_window_specification: AsWindowSpec } | null;
  loc?: LocationRange;
}
export interface Column {
  expr: ExpressionValue;
  as: ValueExpr<string> | string | null;
  type?: string;
  loc?: LocationRange;
}

export interface Interval {
  type: "interval";
  unit: string;
  expr: ValueExpr & { loc?: LocationRange };
}

export type Param = { type: "param"; value: string; loc?: LocationRange };

export type Var = { type: "var"; name: string; members: string[]; prefix: string; loc?: LocationRange };

export type Value = { type: string; value: string | number | boolean | null; loc?: LocationRange };

export type Binary = {
  type: "binary_expr";
  operator: string;
  left: ExpressionValue | ExprList;
  right: ExpressionValue | ExprList;
  loc?: LocationRange;
  parentheses?: boolean;
};

export type Unary = {
  type: "unary_expr";
  operator: string;
  expr: ExpressionValue;
  loc?: LocationRange;
  parentheses?: boolean;
};

export type Expr = Binary | Unary;

export type ExpressionValue =
  | ColumnRef
  | Param
  | Var
  | Function
  | Case
  | AggrFunc
  | Value
  | Binary
  | Unary
  | Cast
  | Interval
  | Star
  | TableColumnAst;

export type ExprList = {
  type: "expr_list";
  value: ExpressionValue[];
  loc?: LocationRange;
  parentheses?: boolean;
  separator?: string;
};

export type PartitionBy = Column[];

export type WindowSpec = {
  name: string | null;
  partitionby: PartitionBy | null;
  orderby: OrderBy[] | null;
  window_frame_clause: WindowFrameClause | null;
};

export type WindowFrameClause = Binary;

export type WindowFrameBound = {
  type: 'preceding' | 'following' | 'current_row';
  value?: 'unbounded' | ExpressionValue;
};

export type AsWindowSpec = string | { window_specification: WindowSpec; parentheses: boolean };

export type NamedWindowExpr = {
  name: string;
  as_window_specification: AsWindowSpec;
};

export type WindowExpr = {
  keyword: 'window';
  type: 'window',
  expr: NamedWindowExpr[];
};

export interface Select {
  with: With[] | null;
  type: "select";
  options: ValueExpr<string>[] | null;
  distinct: "DISTINCT" | null;
  columns: Column[];
  into?: {
    keyword?: string;
    type?: string;
    expr?: Var[] | Value;
    position: 'column' | 'from' | 'end' | null;
  };
  from: From[] | TableExpr | { expr: From[], parentheses: { length: number }, joins: From[] } | null;
  where: Binary | Function | null;
  groupby: { columns: ColumnRef[] | null, modifiers: (ValueExpr<string> | null)[] } | null;
  having: Binary | null;
  orderby: OrderBy[] | null;
  limit: Limit | null;
  window?: WindowExpr | null;
  qualify?: Binary[] | null;
  _orderby?: OrderBy[] | null;
  _limit?: Limit | null;
  parentheses_symbol?: boolean;
  _parentheses?: boolean;
  loc?: LocationRange;
  _next?: Select;
  set_op?: string;
  collate?: CollateExpr | null;
  locking_read?: {
    type: 'for_update' | 'lock_in_share_mode';
    of_tables?: From[];
    wait?: 'nowait' | 'skip_locked' | null;
  } | null;
}
export interface Insert_Replace {
  type: "replace" | "insert";
  table: From[] | From;
  columns: string[] | null;
  values: {
    type: 'values',
    values: InsertReplaceValue[]
  } | Select;
  set?: SetList[];
  partition: string[] | null;
  prefix: string;
  on_duplicate_update?: {
    keyword: "on duplicate key update",
    set: SetList[];
  } | null;
  loc?: LocationRange;
  returning?: Returning
}
export interface Returning {
  type: 'returning';
  columns: Column[];
}
export interface Update {
  with: With[] | null;
  type: "update";
  db?: string | null;
  table: Array<From | Dual> | null;
  set: SetList[];
  where: Binary | Function | null;
  orderby: OrderBy[] | null;
  limit: Limit | null;
  loc?: LocationRange;
  returning?: Returning
}
export interface Delete {
  with: With[] | null;
  type: "delete";
  table: (From & { addition?: boolean })[] | null;
  from: Array<From | Dual>;
  where: Binary | Function | null;
  orderby: OrderBy[] | null;
  limit: Limit | null;
  loc?: LocationRange;
  returning?: Returning
}

export interface Alter {
  type: "alter";
  table: From[];
  expr: AlterExpr[];
  loc?: LocationRange;
}

export type AlterExpr = {
  action: string;
  keyword?: string;
  resource?: string;
  type?: string;
} & Record<string, ExpressionValue | string | null | undefined>;

export interface Use {
  type: "use";
  db: string;
  loc?: LocationRange;
}

export type KW_UNSIGNED = "UNSIGNED";
export type KW_ZEROFILL = "ZEROFILL";

export type Timezone = ["WITHOUT" | "WITH", "TIME", "ZONE"];

export type KeywordComment = {
  type: "comment";
  keyword: "comment";
  symbol?: "=";
  value: string;
};

export type CollateExpr = {
  type: "collate";
  symbol?: "=";
  value: string;
};

export type DataType = {
  dataType: string;
  length?: number;
  parentheses?: true;
  scale?: number;
  suffix?: Timezone | (KW_UNSIGNED | KW_ZEROFILL)[] | OnUpdateCurrentTimestamp | null;
  array?: "one" | "two";
  expr?: Expr | ExprList;
  quoted?: string;
};

export type OnUpdateCurrentTimestamp = {
  type: 'on_update_current_timestamp';
  keyword: 'on update';
  expr: Function;
};

export type LiteralNotNull = {
  type: "not null";
  value: "not null";
};

export type LiteralNull = { type: "null"; value: null | "null" };
export type LiteralNumeric = number | { type: "bigint"; value: string };

export type ColumnConstraint = {
  default_val: {
    type: "default";
    value: ExpressionValue;
  };
  nullable: LiteralNotNull | LiteralNull;
};

export type ColumnDefinitionOptList = {
  nullable?: ColumnConstraint["nullable"];
  default_val?: ColumnConstraint["default_val"];
  auto_increment?: "auto_increment";
  unique?: "unique" | "unique key";
  primary?: "key" | "primary key";
  comment?: KeywordComment;
  collate?: { collate: CollateExpr };
  column_format?: { column_format: ExpressionValue };
  storage?: { storage: ExpressionValue };
  reference_definition?: { reference_definition: ReferenceDefinition };
  character_set?: { type: "CHARACTER SET"; value: string; symbol?: "=" };
  check?: {
    type: 'check';
    expr: Binary;
  };
  generated?: {
    type: 'generated';
    expr: ExpressionValue;
    stored?: 'stored' | 'virtual';
  };
};

export type ReferenceDefinition = {
  definition: ColumnRef[];
  table: From[];
  keyword: string;
  match: string | null;
  on_action: OnReference[];
};

export type OnReference = {
  type: 'on_reference';
  keyword: 'on delete' | 'on update';
  value: 'restrict' | 'cascade' | 'set null' | 'no action' | 'set default';
};

export type CreateColumnDefinition = {
  column: ColumnRef;
  definition: DataType;
  resource: "column";
} & ColumnDefinitionOptList;

export type IndexType = {
  keyword: "using";
  type: "btree" | "hash" | "gist" | "gin";
};

export type IndexOption = {
  type: "key_block_size";
  symbol?: "=";
  expr: LiteralNumeric;
};

export type CreateIndexDefinition = {
  index?: string | null;
  definition: ColumnRef[];
  keyword: "index" | "key";
  index_type?: IndexType | null;
  resource: "index";
  index_options?: IndexOption[] | null;
};

export type CreateFulltextSpatialIndexDefinition = {
  index?: string | null;
  definition: ColumnRef[];
  keyword?:
    | "fulltext"
    | "spatial"
    | "fulltext key"
    | "spatial key"
    | "fulltext index"
    | "spatial index";
  index_options?: IndexOption[] | null;
  resource: "index";
};

export type ConstraintName = { keyword: "constraint"; constraint: string };

export type CreateConstraintPrimary = {
  constraint?: ConstraintName["constraint"] | null;
  definition: ColumnRef[];
  constraint_type: "primary key";
  keyword?: ConstraintName["keyword"] | null;
  index_type?: IndexType | null;
  resource: "constraint";
  index_options?: IndexOption[] | null;
};

export type CreateConstraintUnique = {
  constraint?: ConstraintName["constraint"] | null;
  definition: ColumnRef[];
  constraint_type: "unique key" | "unique" | "unique index";
  keyword?: ConstraintName["keyword"] | null;
  index_type?: IndexType | null;
  index?: string | null;
  resource: "constraint";
  index_options?: IndexOption[] | null;
};

export type CreateConstraintForeign = {
  constraint?: ConstraintName["constraint"] | null;
  definition: ColumnRef[];
  constraint_type: "foreign key" | "FOREIGN KEY";
  keyword?: ConstraintName["keyword"] | null;
  index?: string | null;
  resource: "constraint";
  reference_definition?: ReferenceDefinition;
};

export type CreateConstraintCheck = {
  constraint?: ConstraintName["constraint"] | null;
  definition: Binary[];
  constraint_type: "check";
  keyword?: ConstraintName["keyword"] | null;
  resource: "constraint";
  index_type?: IndexType | null;
};

export type CreateConstraintDefinition =
  | CreateConstraintPrimary
  | CreateConstraintUnique
  | CreateConstraintForeign
  | CreateConstraintCheck;

export type CreateDefinition =
  | CreateColumnDefinition
  | CreateIndexDefinition
  | CreateFulltextSpatialIndexDefinition
  | CreateConstraintDefinition;

export interface Create {
  type: "create";
  keyword: "aggregate" | "table" | "trigger" | "extension" | "function" | "index" | "database" | "schema" | "view" | "domain" | "type" | "user";
  temporary?: "temporary" | null;
  table?: { db: string; table: string }[] | { db: string | null, table: string };
  if_not_exists?: "if not exists" | null;
  like?: {
    type: "like";
    table: From[];
    parentheses?: boolean;
  } | null;
  ignore_replace?: "ignore" | "replace" | null;
  as?: string | null;
  query_expr?: Select | null;
  create_definitions?: CreateDefinition[] | null;
  table_options?: TableOption[] | null;
  index_using?: {
    keyword: "using";
    type: "btree" | "hash";
  } | null;
  index?: string | null | { schema: string | null, name: string};
  on_kw?: "on" | null;
  index_columns?: ColumnRefItem[] | null;
  index_type?: "unique" | "fulltext" | "spatial" | null;
  index_options?: IndexOption[] | null;
  algorithm_option?: {
    type: "alter";
    keyword: "algorithm";
    resource: "algorithm";
    symbol: "=" | null;
    algorithm: "default" | "instant" | "inplace" | "copy";
  } | null;
  lock_option?: {
    type: "alter";
    keyword: "lock";
    resource: "lock";
    symbol: "=" | null;
    lock: "default" | "none" | "shared" | "exclusive";
  } | null;
  database?: string | { schema: ValueExpr[] };
  loc?: LocationRange;
  where?: Binary | Function | null;
  definer?: Binary | null;
  for_each?: 'row' | 'statement' | null;
  events?: TriggerEvent[] | null;
  order?: {
    type: 'follows' | 'precedes';
    trigger: string;
  } | null;
  execute?: SetList[] | null;
  replace?: boolean;
  algorithm?: 'undefined' | 'merge' | 'temptable' | null;
  sql_security?: 'definer' | 'invoker' | null;
  select?: Select | null;
  view?: From | null;
  with?: 'cascaded' | 'local' | null;
  user?: UserAuthOption[] | null;
  default_role?: string[] | null;
  require?: RequireOption | null;
  resource_options?: ResourceOption[] | null;
  password_options?: PasswordOption[] | null;
  lock_option_user?: 'account lock' | 'account unlock' | null;
  comment_user?: string | null;
  attribute?: string | null;
}

export type TriggerEvent = {
  keyword: 'insert' | 'update' | 'delete';
  args?: ColumnRef[];
};

export type UserAuthOption = {
  user: string;
  auth_option?: {
    type: 'identified_by' | 'identified_with';
    value: string;
  };
};

export type RequireOption = {
  type: 'require';
  value: 'none' | 'ssl' | 'x509' | RequireOptionDetail[];
};

export type RequireOptionDetail = {
  type: 'issuer' | 'subject' | 'cipher';
  value: string;
};

export type ResourceOption = {
  type: 'max_queries_per_hour' | 'max_updates_per_hour' | 'max_connections_per_hour' | 'max_user_connections';
  value: number;
};

export type PasswordOption = {
  type: 'password_expire' | 'password_history' | 'password_reuse_interval' | 'password_require_current';
  value: number | string | null;
};

export type TableOption = {
  keyword: string;
  symbol?: '=';
  value: ExpressionValue | string | number;
};

export interface Drop {
  type: "drop";
  keyword: string;
  name: From[];
  prefix?: 'if exists' | null;
  options?: 'restrict' | 'cascade' | null;
  table?: From | null;
}

export interface Show {
  type: "show";
  keyword: string;
  suffix?: string;
  from?: From;
  where?: Binary | Function | null;
  like?: {
    type: 'like';
    value: string;
  } | null;
  loc?: LocationRange;
}

export interface Desc {
  type: "desc";
  table: string;
  loc?: LocationRange;
}

export interface Explain {
  type: "explain";
  expr: Select | Update | Delete | Insert_Replace;
  format?: string;
  loc?: LocationRange;
}

export interface Call {
  type: "call";
  expr: Function;
  loc?: LocationRange;
}

export interface Set {
  type: "set";
  keyword?: string;
  expr: SetList[];
  loc?: LocationRange;
}

export interface Lock {
  type: "lock";
  keyword: "tables";
  tables: LockTable[];
  loc?: LocationRange;
}

export type LockTable = {
  table: From;
  lock_type: {
    type: 'read' | 'write';
    suffix?: null;
    prefix?: null;
  };
};

export interface Unlock {
  type: "unlock";
  keyword: "tables";
  loc?: LocationRange;
}

export interface Grant {
  type: "grant";
  keyword: "priv";
  objects: Array<{
    priv: ValueExpr;
    columns: ColumnRef[] | null;
  }>;
  on: {
    object_type: 'table' | 'function' | 'procedure' | null;
    priv_level: Array<{
      prefix: string;
      name: string;
    }>;
  };
  to_from: "TO" | "FROM";
  user_or_roles: Array<{
    name: ValueExpr;
    host: string | null;
  }>;
  with: any | null;
  loc?: LocationRange;
}

export type PrivilegeItem = {
  type: 'privilege';
  priv_type: string;
  columns?: ColumnRef[];
};

export type PrivilegeLevel = {
  type: 'priv_level';
  db?: string;
  table?: string;
};

export type UserOrRole = {
  type: 'user';
  user: string;
  host?: string;
};

export interface LoadData {
  type: "load_data";
  mode?: string | null;
  local?: 'local' | null;
  file: ValueExpr;
  replace_ignore?: 'replace' | 'ignore' | null;
  table: { db: string | null; table: string };
  partition?: ValueExpr<string>[] | null;
  character_set?: string | null;
  fields?: LoadDataField | null;
  lines?: LoadDataLine | null;
  ignore?: number | null;
  column?: ColumnRef[] | null;
  set?: SetList[] | null;
  loc?: LocationRange;
}

export type LoadDataField = {
  terminated_by?: string;
  enclosed_by?: { value: string; optionally?: boolean };
  escaped_by?: string;
};

export type LoadDataLine = {
  starting_by?: string;
  terminated_by?: string;
};

export interface Truncate {
  type: "truncate";
  keyword: "table";
  name: From[];
  loc?: LocationRange;
}

export interface Rename {
  type: "rename";
  table: Array<[{ db: string | null; table: string }, { db: string | null; table: string }]>;
  loc?: LocationRange;
}

export interface Transaction {
  type: "transaction";
  expr: {
    action: ValueExpr<"start" | "begin" | "commit" | "rollback" | "START" | "COMMIT" | "ROLLBACK">;
    keyword?: "TRANSACTION";
    modes?: TransactionMode[] | null;
  };
  loc?: LocationRange;
}

export type TransactionMode = ValueExpr<'read write' | 'read only'> | TransactionIsolationLevel;

export type TransactionIsolationLevel = {
  keyword: 'isolation level';
  value: 'read uncommitted' | 'read committed' | 'repeatable read' | 'serializable';
};

export type AST =
  | Use
  | Select
  | Insert_Replace
  | Update
  | Delete
  | Alter
  | Create
  | Drop
  | Show
  | Desc
  | Explain
  | Call
  | Set
  | Lock
  | Unlock
  | Grant
  | LoadData
  | Truncate
  | Rename
  | Transaction;

export class Parser {
  constructor();

  parse(sql: string, opt?: Option): TableColumnAst;

  astify(sql: string, opt?: Option): AST[] | AST;

  sqlify(ast: AST[] | AST, opt?: Option): string;

  exprToSQL(ast: ExpressionValue | ExprList | OrderBy | ColumnRef, opt?: Option): string;

  whiteListCheck(
    sql: string,
    whiteList: string[],
    opt?: Option
  ): Error | undefined;

  tableList(sql: string, opt?: Option): string[];

  columnList(sql: string, opt?: Option): string[];
}
