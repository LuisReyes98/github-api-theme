{% include "javascript/tabulator_table_dependencies.js" %}


let requested_data = '{{response_json}}'; //getting the data in json format from the lighttouch server
let tableId = "#{{issue_table_id}}";

// Class to standarize the data 
class Issue {
  constructor(state, title, body, subject, labels, creator, locked, assignees, comments, author_association, created_at, updated_at, closed_at) {
    this.state = state;
    this.title = title;
    this.body = body;
    this.subject = subject;
    this.labels = labels; //an array of labels
    this.creator = creator;
    this.locked = locked;
    this.assignees = assignees;
    this.comments = comments; //an array of comments
    this.author_association = author_association;
    this.created_at = this.format_date(created_at);
    this.updated_at = this.format_date(updated_at);
    this.closed_at = this.format_date(closed_at);

  }

  format_date(date_string) {
    let d = new Date(date_string);
    return `${d.getUTCMonth()}/${d.getUTCDay()}/${d.getUTCFullYear()}`;      
    
  }
}

// Transforming data sended by the server into a js hash
requested_data = requested_data.replace(/&quot;/g, "\""); //replacing &quot; mark for " for javascript
requested_data = requested_data.replace(/&#x2f;/g, "/"); //replacing &#x2f; mark for /  for urls 
requested_data = JSON.parse(requested_data);

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
  autoResize: true,
  pagination: "local", //enable local pagination.
  paginationSize: 6, //ammount of elements per page  
  // layout: "fitColumns", //Tell the columns to fit in the screen
  // movableColumns: true, //allow column order to be changed
  // resizableRows: true, //allow rows size to change
  tooltips: true,            //show tool tips on cells
  columns: [
    {% for column in issue_columns %}
      {
        title: "{{column.name}}",
        field: "{{column.value}}",
        sorter: "string",
        formatter: "plaintext"
      },
    {% endfor %}
  ],

});

// Filtering functions
// This could be done without Jquery if jquery wont be used for anythin else this should be refactor to plain js

function clearTableFilters() {
  $("#table-filter-field").val("");
  $("#table-filter-value").val("");

  table.clearFilter();
}
// Table filters

function updateFilter() {
  var filter = $("#table-filter-field").val();
  if (filter !== "") {
    $("#table-filter-value").prop("disabled", false);  
    table.setFilter(filter, "like", $("#table-filter-value").val()); //to search values like the input    
  }
}

//Update filters on value change
$("#table-filter-field").change(updateFilter);
$("#table-filter-value").keyup(updateFilter);
