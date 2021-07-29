"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Swab extends Model {
  static get table() {
    return "swab";
  }
}

module.exports = Swab;
