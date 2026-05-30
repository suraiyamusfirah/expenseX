"use strict";

let dbm;
let type;

exports.setup = function setup(options) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
};

exports.up = function up(db) {
  return db.createTable("transactions", {
    id: {
      type: "string",
      length: 36,
      primaryKey: true,
      notNull: true
    },
    type: {
      type: "string",
      length: 16,
      notNull: true
    },
    amount: {
      type: "decimal",
      precision: 12,
      scale: 2,
      notNull: true
    },
    category: {
      type: "string",
      length: 120,
      notNull: true
    },
    note: {
      type: "text"
    },
    date: {
      type: "date",
      notNull: true
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      defaultValue: new String("CURRENT_TIMESTAMP")
    }
  });
};

exports.down = function down(db) {
  return db.dropTable("transactions");
};

exports._meta = {
  version: 1
};
