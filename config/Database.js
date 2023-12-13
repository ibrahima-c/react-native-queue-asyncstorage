/**
 * DB imitation based on array with help of RN AsyncStorage
 */

import storage from './Storage';


/*

=== SCHEMA ===

JobSchema = {
  name: 'Job',
  primaryKey: 'id',
  properties: {
    id:  'string', // UUID.
    name: 'string', // Job name to be matched with worker function.
    payload: 'string', // Job payload stored as JSON.
    data: 'string', // Store arbitrary data like "failed attempts" as JSON.
    priority: 'int', // -5 to 5 to indicate low to high priority.
    active: { type: 'bool', default: false}, // Whether or not job is currently being processed.
    timeout: 'int', // Job timeout in ms. 0 means no timeout.
    created: 'date', // Job creation timestamp.
    failed: 'date?' // Job failure timestamp (null until failure).
  }
}

=== ====== ===

*/

const BACKUP_TIME = 15000;
const Job = '@queue:Job';

export default class Database {
  db = [];

  init = async () => {
    // await storage.delete(Job); // to delete all jobs
    await this._restore();
    await this._backup();
  }

  _restore = async () => {
    const jobDB = await storage.get(Job);
    this.db = jobDB || [];
  }

  _backup = async () => {
    await storage.save(Job, this.db.slice());

    setTimeout(await this._backup, BACKUP_TIME);
  }

  create = async (obj) => {
    let shouldSkip = false; // if obj.id is already in array

    for (let i = 0; i < this.db.length; i += 1) {
      if (this.db[i] === obj.id) shouldSkip = true;
    }

    if (!shouldSkip) {
      this.db.push(obj);
      await this._backup();
    }


  };

  objects = () => this.db.slice();

  save = async (obj) => {
    for (let i = 0; i < this.db.length; i += 1) {
      if (this.db[i] === obj.id) this.db[i] = obj;
    }
    await this._backup()
  }

  saveAll = async (objs) => {
    this.db = objs;
    await this._backup()
  }

  delete = async (obj) => {
    this.db = this.db.filter(o => o.id !== obj.id);
    await this._backup()
  };

  deleteAll = async () => {
    this.db = [];
    await this._backup()
  };

}
