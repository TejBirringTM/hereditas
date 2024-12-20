import * as v from "@valibot/valibot";
import { airtableRecords } from "../airtable/main.ts";
import { FieldSet, SelectOptions } from "airtable";
import debugOnly from "../framework/debug-only.ts";
import { ReadonlyDeep } from "type-fest";
import { assert } from "@std/assert";

interface TableSyncOptions {
    selectOptions?: SelectOptions<FieldSet>;
    ttlInMilliseconds: number;
}

export class TableSync<
  TEntries extends v.ObjectEntries,
  TMessage extends v.ErrorMessage<v.ObjectIssue> | undefined,
> {
    private readonly baseId: string;
    private readonly tableId: string;
    private readonly selectOptions: SelectOptions<FieldSet>;
    private readonly schema: v.ObjectSchema<TEntries, TMessage>;
    private readonly ttl: number;
    private _records : v.InferObjectOutput<TEntries>[] = [];
    private lastFetchTimestamp : number;

    constructor(baseId: string, tableId: string, options: TableSyncOptions, schema: v.ObjectSchema<TEntries, TMessage>) {
        this.baseId = baseId;
        this.tableId = tableId;
        this.selectOptions = options.selectOptions ?? {};
        this.ttl = options.ttlInMilliseconds;
        this.schema = schema;
        this.lastFetchTimestamp = 0;
    }

    private async fetch() {
        debugOnly(()=>{
            console.debug(`Syncing 'airtable:${this.baseId}:${this.tableId}'`);
        })
        this._records = await airtableRecords(this.baseId, this.tableId, this.selectOptions, this.schema);
        this.lastFetchTimestamp = Date.now();
        debugOnly(()=>{
            console.debug(`Done syncing 'airtable:${this.baseId}:${this.tableId}' @ ${this.lastFetchTimestamp}`);
        })
    }

    async records() {
        if (Date.now() - this.lastFetchTimestamp > this.ttl) {
            await this.fetch();
        }
        return Object.freeze(this._records) as ReadonlyDeep<typeof this._records>;
    }

    get lastFetch() {
        return this.lastFetchTimestamp;
    }
}