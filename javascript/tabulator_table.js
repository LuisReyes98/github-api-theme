{% include "javascript/tabulator_table_dependencies.js" %}


let requested_data = '{{response_json}}'; //getting the data in json format from the lighttouch server
let tableId = "#{{issue_table_id}}";

// Class to standarize the data 
class Issue {
  constructor(status, title, body, issue_url, created_date, labels) {
    this.status = status;
    this.title = title;
    this.body = body;
    this.issue_url = issue_url;
    this.created_date = this.format_date(created_date);
    this.labels = labels; //an array of labels

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
  try {  
    labels = item.labels.map(el => el.name); 
  } catch (error) { }

  return new Issue(
    item.state,
    item.title,
    item.body,
    item.html_url,
    item.created_at,
    labels,
  );
});



// Tabulator component
let table = new Tabulator(tableId, {
  data: cleaned_data,
  autoResize: true,
  pagination: "local", //enable local pagination.
  paginationSize: 4, //ammoun of elements per page
  layout: "fitColumns", //Tell the columns to fit in the screen
  movableColumns: true, //allow column order to be changed
  resizableRows: true, //allow rows size to change
  // responsiveLayout:true,
  columns: [
    {
      title: "Status",
      field: "status",
      sorter: "string"
    },
    {
      title: "Title",
      field: "title",
      sorter: "string"
    },
    {
      title: "Body",
      field: "body",
      sorter: "string"
    },
    {
      title: "Labels",
      field: "labels",
      sorter: "string"
    },
    {
      title: "Issue URL",
      field: "issue_url",
      sorter: "string"
    },
    {
      title: "Created at",
      field: "created_date",
      sorter: "string"
    },
  ],
});

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