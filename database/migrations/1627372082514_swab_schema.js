"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class SwabSchema extends Schema {
  up() {
    this.create("swab", (table) => {
      table.increments();
      table.string("nama");
      table.string("nik");
      table.date("tgl_lahir");
      table.integer("usia");
      table.enu("jk", ["L", "P"]);
      table.string("alamat");
      table.string("provinsi");
      table.string("kota");
      table.string("kecamatan");
      table.string("kelurahan");
      table.integer("rw");
      table.integer("rt");
      table.date("pengambilan_spesimen");
      table.string("no_spesimen");
      table.string("hasil");
      table.boolean("dihapus").defaultTo(0);
      table.timestamps();
    });
  }

  down() {
    this.drop("swab");
  }
}

module.exports = SwabSchema;
