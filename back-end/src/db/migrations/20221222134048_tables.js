
exports.up = function(knex) {
    return knex.schema.createTable("tables", (table) => {
        table.increments("table_id").primary();
        table.smallint("capacity");
        table.string("table_name");
        table.smallint("reservation_id").defaultTo(null)


    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("tables");
};