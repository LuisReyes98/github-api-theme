{% include "javascript/tabulator_table_dependencies.js" %}


let requested_data = '{{response_json}}'; //getting the data in json format from the lighttouch server
let tableId = "#{{issue_table_id}}";

let github_data = '';
// Class to standarize the data 

function temporal_json_parser(the_json) {
  
}
// github_data = github_data.replace(/&quot;/g, "\""); //replacing &quot; mark for " for javascript
// github_data = github_data.replace(/&#x2f;/g, "/"); //replacing &#x2f; mark for /  for urls 
// github_data = JSON.parse(github_data);

// Transforming data sended by the server into a js hash
requested_data = requested_data.replace(/&quot;/g, "\""); //replacing &quot; mark for " for javascript
requested_data = requested_data.replace(/&#x2f;/g, "/"); //replacing &#x2f; mark for /  for urls 
requested_data = JSON.parse(requested_data);

class Issue {
  constructor(status, title, body, subject, labels, creator, locked, assignees, comments, author_association, created_at, updated_at, closed_at) {
    this.status = status; //status of issues 
    this.title = title; //title of the issues 
    this.body = body; //body of the issue
    this.subject = subject; //subject of the issue
    this.labels = labels; //an array of labels
    this.creator = creator; //creator
    this.locked = locked; // is it locked 
    this.assignees = assignees; //people assigened to the issue
    this.comments = comments; //an array of comments
    this.author_association = author_association; //author association to the issue , MEMBER , CREATOR , DEVELOPER , etc...
    this.created_at = this.format_date(created_at); //date of creation 
    this.updated_at = this.format_date(updated_at);//date of change 
    this.closed_at = this.format_date(closed_at);//date the issue was closed, it will Nan/Nan/Nan when date doesn't exist aka the issue is still open  

  }

  format_date(date_string) {
    let d = new Date(date_string);
    return `${d.getUTCMonth()}/${d.getUTCDay()}/${d.getUTCFullYear()}`;      
    
  }
}
// This considering is the github request

// turning the js hash into an array of Issue prototype in order to properly display data
let cleaned_data = requested_data.items.map(function (item) {
  let labels = " "
  let assignees = " "
  let comments = " "
  try {  
    labels = item.labels.map(el => el.name); 
  } catch (error) { }
  try {
    assignees = item.assignees.map(el => el.name);
  } catch (error) {}
  try {
    comments = item.comments_content.map(el => `${el.title} by ${el.creator}:\n ${el.body}`);
  } catch (error) {}

  return new Issue(
    item.state,
    item.title,
    item.body,
    item.subject,
    labels,
    item.creator,
    item.locked,
    assignees,
    comments,
    item.author_association,
    item.created_at,
    item.updated_at,
    item.closed_at,
  );
});



// Tabulator component
let table = new Tabulator(tableId, {
  data: cleaned_data,  
  // autoResize: true,
  pagination: "local", //enable local pagination.
  paginationSize: 4, //ammount of elements per page  
  // movableColumns: true, //allow column order to be changed  
  tooltips: true,            //show tool tips on cells
  // layout: "fitColumns",
  columns: [
    {% for column in issue_columns %}
      {
        title: "{{column.name}}",
        field: "{{column.value}}",
        sorter: "string",
        headerFilter: "input",
        headerFilterPlaceholder: "Filter {{column.name}}",
        headerFilterFunc: "like",
        formatter: function (cell, formatterParams, onRendered) {
          //cell - the cell component
          //formatterParams - parameters set for the column
          //onRendered - function to call when the formatter has been rendered

          cell.getElement().setAttribute("title_of_data", cell._cell.column.definition.title); //adding the attribute to each cell with the same value as the title of the column header in for that cell

			    return this.emptyToSpace(this.sanitizeHTML(cell.getValue()));
        },
        
        // resizable: false,
      },
    {% endfor %}
  ],

});

// function to reload the table when the browser window changes size
window.addEventListener('resize', function () {
  table.redraw(true); //reloading table visuals
});

// Filtering functions
// This could be done without Jquery if jquery wont be used for anythin else this should be refactor to plain js

// function clearTableFilters() {
//   $("#table-filter-field").val("");
//   $("#table-filter-value").val("");

//   table.clearFilter();
// }
// // Table filters

// function updateFilter() {
//   var filter = $("#table-filter-field").val();
//   if (filter !== "") {
//     $("#table-filter-value").prop("disabled", false);  
//     table.setFilter(filter, "like", $("#table-filter-value").val()); //to search values like the input    
//   }
// }

// //Update filters on value change
// $("#table-filter-field").change(updateFilter);
// $("#table-filter-value").keyup(updateFilter);
