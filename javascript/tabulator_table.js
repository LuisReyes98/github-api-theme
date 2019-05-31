{% include "javascript/tabulator_table_dependencies.js" %}

let $tableId = "#{{issue_table_id}}";

let server_response = {{ git_response | safe }};

function stringFormatUnderScoreToSpace(someText) {
  someText = someText.charAt(0).toUpperCase() + someText.slice(1);
  someText = someText.replace(/_/g, " ");
  return someText;
}

// Tabulator component
let table = new Tabulator($tableId, {
  data: server_response,
  pagination: "local", //enable local pagination.
  paginationSize: 10, //ammount of elements per page  
  paginationSizeSelector: true,
  tooltips: true,            //show tool tips on cells
  // autoResize: true,
  // movableColumns: true, //allow column order to be changed  
  // layout: "fitColumns",
  columns: Object.keys(server_response[0]).map(function (item) {
    /*for each key values in the first element assuming all elemnents behave the same
      as they are part of the same group of data
    */
    return {
      title: stringFormatUnderScoreToSpace(item), //first letter captalize
      field: item,
      sorter: "string",
      headerFilter: "input",
      headerFilterPlaceholder: `Filter ${item}`,
      headerFilterFunc: "like",
      formatter: function (cell, formatterParams, onRendered) {        
        /*
          cell - the cell component
          formatterParams - parameters set for the column
          onRendered - function to call when the formatter has been rendered            
        
          adding the attribute to each cell with the same 
          value as the title of the column header in
          for that cell,this is used so the custom css can show the column name when needed
        */
        cell.getElement().setAttribute("title_of_data", cell._cell.column.definition.title); 
        return this.emptyToSpace(this.sanitizeHTML(cell.getValue()));
      },            
    }
  })      
});
// function to reload the table when the browser window changes size
window.addEventListener('resize', function () {
  table.redraw(true); //reloading table visuals
});
