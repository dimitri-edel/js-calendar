/*
    class DTECalendar 
    purpose: 
        Creates a calendar and attaches it to a specified container in the DOM

    contructor(weekday_names, month_names, container, format):
        @parameter weekday_names:
            type: array with names of days that will be used as labels for the headings in the calendar
            NOTE: The array must be eight entries long, the first entry at the index 0  must contain an
                empty string. The reason for that is that the calendar uses indices 1-7 for weekdays
            EXAMPLE: const weekday_names = ["", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];

        @parameter month_names:
            type: array with names of months that will be used to display month names in the control panel
            EXAMPLE: const month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        @parameter container:
            type: HTML-Element (HTML tag a <div>)
            EXAMPLE: Let's say you have a div element in your HTML document : <div id="container" />
                    let container = document.getElementById("container");
                    let calendar = new DTECalendar(weekday_names, month_names, container, "en");

        @parameter format:
            type: string "eu" or "en"
            purpose: If you pass "eu" to the contructor, it will assume that the week starts with a Monday.
                    If you pass "en" it will asume that the week starts with a Sunday.
            NOTE: weekday_names must correspond to this setting

        PUBLIC METHODS:
            addOnClickCalendarCellListner(<function>)
            purpose: this function will be called if the user clicks on one of the cells(days) in the calendar
            The function must have this signature function(day, month, year). The callendar will call it and
            pass the corresponding numbers to it.
            NOTE: If you do not define a callback function and the user clicks on one of the days, they will 
                get an alert with the number of the day. If the cell has no number in it, then nothing's going
                to happen.
            

*/
class DTECalendar {
    constructor(weekday_names, month_names, container, format) {
        // dummy for json fields
        this.json = ["02. Aug 2023 10:00", "02. Aug 2023 11:30", "03 Aug 2023 12:00", "01 Sep 2023 10:00", "02. Sep 20:00", "01. Nov 2023 10:00"];
        // Two formats are supported : en = week begins with sunday, eu = weeks begins with monday        
        this.calendar_format = format;
        // Slot for the callback-function that will be called by the onClickCalendarCell() method
        // if this property is not null
        // To register this function pass it to the addOnclickCalendarCellListner(<function>) method
        // on the instance of this class
        this.onClickCalendarCellListener = null;
        // Pointer to the function that should be called if the user clicks on the next month button
        // in the control panel
        this.onClickNextMonthListener = null;
        // Pointer to the function that should be called if the user clicks on the previous month button
        // in the control panel
        this.onClickPrevMonthListner = null;
        // The array registered at this address will contain the lists of items for each cell in the calendar
        // Use the addCalendarItemList(<array>) to set The items that should be displayed in the cells
        this.calendarCellItemLists = this.#createEmptyTaskList();
        // The main container, which will contain all the calendar cells and headings and buttons
        this.calendar_container = document.createElement("div");
        this.calendar_container.id = "calendar-container";
        this.calendar_container.className = "calendar-container";
        // The first weekday must be blank, so we have natural numbers for weekdays(1,2,3,etc)
        this.weekday_names = weekday_names;
        // Names of months that will be used in the control panel
        this.month_names = month_names;
        // Set the current date
        this.current_date = new Date();
        // Set the selected date, year and month to the current date
        this.selected_date = this.current_date;
        this.selected_month = this.current_date.getMonth();
        this.selected_year = this.current_date.getFullYear();
        // The main container is the HTML-Element to which the calendar will be appended
        this.main_container = container;
        // The control panel harbors the buttons for switching between months and the heading
        // that shows the selected month and year
        this.control_panel = document.createElement("div");
        this.control_panel.id = "calendar-control-panel";
        this.control_panel.className = "calendar-control-panel";
        this.#createControlPanel();
        // Append the control panel and the calendar to the HTML-Element that was passed to the contructor
        this.main_container.appendChild(this.control_panel);
        this.main_container.appendChild(this.calendar_container);
        this.#createContainer();

        this.#setMonth(this.current_date.getMonth(), this.current_date.getFullYear());
    }
    // Change the list of names for the weekdays, that will be applied to the calendar
    setWeekdayNames = (names_array) => {
        this.weekday_names = names_array;
    }
    /*  private method that creates the control panel with name of month(from the array that was passed
        to the constructor) and the year. Also, it sets up buttons for navigating between months.
    */
    #createControlPanel = () => {
        let left_button = document.createElement("button");
        left_button.innerHTML = "<<<";
        left_button.addEventListener("click", this.#onClickPrevMonth);
        this.control_panel.appendChild(left_button);

        let heading = document.createElement("span");
        heading.id = "calendar-heading";
        heading.innerHTML = `${this.#getMonthName(this.current_date.getMonth())} ${this.selected_year}`;
        this.control_panel.appendChild(heading);

        let right_button = document.createElement("button");
        right_button.innerHTML = ">>>";
        right_button.addEventListener("click", this.#onClickNextMonth);
        this.control_panel.appendChild(right_button);
    }
    // Retrieves the representation of the month from the array that was passed to the constructor
    #getMonthName = (month) => {
        return this.month_names[month];
    }

    #onClickNextMonth = () => {
        this.#calculateNextMonth();
        this.#clearCalendarCells();
        // If there is a litner, call it
        if(this.onClickNextMonthListener != null){
            this.onClickNextMonthListener(this.selected_month+1, this.selected_year);
        }
        this.#setMonth(this.selected_month, this.selected_year);
        this.#updateElements();
        console.log(`current year :${this.selected_year} current_month:${this.selected_month}`);
    }

    #calculateNextMonth = () => {
        let current_month = this.selected_month;
        if (current_month == 11) {
            this.selected_month = 0;
            this.selected_year++;
        } else {
            this.selected_month++;
        }
    }

    #onClickPrevMonth = () => {
        this.#calculatePrevMonth();
        this.#clearCalendarCells();
        // If there is a litner, call it
        if(this.onClickPrevMonthListner != null){
            this.onClickPrevMonthListner(this.selected_month+1, this.selected_year);
        }
        this.#setMonth(this.selected_month, this.selected_year);
        this.#updateElements();
        console.log(`current year :${this.selected_year} current_month:${this.selected_month}`);
    }

    #calculatePrevMonth = () => {
        let current_month = this.selected_month;
        if (current_month == 0) {
            this.selected_month = 11;
            this.selected_year--;
        } else {
            this.selected_month--;
        }
    }

    #updateElements = () => {
        // Update the heading
        let heading = document.getElementById("calendar-heading");
        heading.innerHTML = `${this.#getMonthName(this.selected_month)} ${this.selected_year}`;
    }

    #createEmptyTaskList(){
        let task_list = [];
        for(let i=0; i <= 31; i++){
            task_list[i] = [];
        }
        return task_list;
    }

    #createContainer = () => {
        let weekdays_row = document.createElement("div");
        weekdays_row.id = "calendar-weekday-names-row";
        weekdays_row.className = "calendar-row";
        this.#createWeekdayHeadings(weekdays_row);
        this.calendar_container.appendChild(weekdays_row);

        for (let i = 1; i < 7; i++) {
            let row_elem = document.createElement("div",);
            row_elem.id = `clanendar-row-${i}`;
            row_elem.className = "calendar-row";
            this.#createRow(row_elem, i);
            this.calendar_container.appendChild(row_elem);
        }
    }

    #createWeekdayHeadings = (row) => {
        for (let i = 1; i <= 7; i++) {
            let span_elem = document.createElement("span");
            span_elem.id = `clanendar-weekday-${i}`;
            span_elem.innerHTML = ` ${this.weekday_names[i]} `;
            row.appendChild(span_elem);
        }
    }

    // Append seven spans to the row and give them an appropriate id='calendar-<row>-<column>'
    // Then add an event listener to that span element
    // Inside the span, add another span for the label that bears the number of the day
    #createRow = (row, index) => {
        for (let i = 1; i <= 7; i++) {
            // The cell 
            let span_elem = document.createElement("span");
            // Label with day number
            let label = document.createElement("span");
            // List to hold items like icons or names, the items will be added using <li>
            // That shoudl appear inside the cell
            let item_list = document.createElement("ul");
            item_list.className = "calendar-cell-item-list";
            // Set up the label with the number of the day
            label.className = "calendar-cell-day-label";
            label.innerHTML = "...";
            // Add an eventListener to the cell
            span_elem.addEventListener("click", this.#onClickCalendarCell);
            // Append the label to the cell
            span_elem.appendChild(label);
            // Append the list to the cell
            span_elem.appendChild(item_list);
            // Give the cell an id='calendar-<row>-<column>'
            span_elem.id = `calendar-${index}-${i}`;
            // Append the cell to the row
            row.appendChild(span_elem);
        }
    }

    // will be executed if a cell on the callendar has been clicked
    #onClickCalendarCell = (e) => {
        // See if the string is a representation of a number
        const isNumeric = (str) => {
            // If not a string then don't bother processing
            if (typeof str != "string") return false;
            return !isNaN(str);
        }

        let cell = document.getElementById(e.currentTarget.id);
        let label = cell.getElementsByClassName("calendar-cell-day-label");
        if (isNumeric(label[0].innerHTML)) {
            let day = parseInt(label[0].innerHTML);

            // If there is a callback function registered call it
            // and pass it the day number as an integer
            if (this.onClickCalendarCellListener != null) {
                this.onClickCalendarCellListener(day, this.selected_month + 1, this.selected_year);
            } else {
                alert("" + day + "." + (this.selected_month + 1) + "." + this.selected_year);
            }
        }
    }

    // Register a function that will be called if a cell on the calendar has been clicked
    addOnClickCalendarCellListner(func) {
        this.onClickCalendarCellListener = (day, month, year) => {
            func(day, month, year);
        }
    }
    // Register a function that will be called if the user clicks on the next month buttoon in 
    // the control panel
    addOnClickNextMonthListner(func){
        this.onClickNextMonthListener = (month, year) => {
            this.calendarCellItemLists = func(month, year);
        }
    }

    // Register a function that will be called if the user clicks on the previous month buttoon in 
    // the control panel
    addOnClickPrevtMonthListner(func){
        this.onClickPrevMonthListner = (month, year) => {
            this.calendarCellItemLists = func(month, year);
        }
    }    

    // Returns true if the year parameter is a leap year
    #isLeapYear(year) {
        return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
    }

    // Returns the number of days in the given month
    #getLastDayOfMonth = (month, year) => {
        // Since months are numbered 0-11, the number of days in each month can
        // be stored in the array, where the index corresponds to the month number
        let days_in_month = new Array();
        days_in_month[0] = 31; // January
        days_in_month[1] = this.#isLeapYear(year) ? 29 : 28; // February
        days_in_month[2] = 31; // March
        days_in_month[3] = 30; // April
        days_in_month[4] = 31; // May
        days_in_month[5] = 30; // June
        days_in_month[6] = 31; // July
        days_in_month[7] = 31; // August
        days_in_month[8] = 30; // September
        days_in_month[9] = 31; // October
        days_in_month[10] = 30;// November
        days_in_month[11] = 31;// Decmeber

        return days_in_month[month];
    }

    // It is imaprative that this method be called after #createContainer
    #setMonth = (month, year) => {
        // Determine which weekday is the first day of the month
        let first_day = new Date(year, month, 1);
        // Weekdays are numbered 0-6, 0:Sunday, 1:monday, 2:tuesday, etc.
        let first_week_day = first_day.getDay();
        // Find out how many days in the month
        let last_day_of_month = this.#getLastDayOfMonth(month, year);

        let day_number = 1;
         

        // the rows and columns are numbered 1-7
        for (let row = 1; row < 7; row++) {
            for (let column = 1; column <= 7; column++) {
                if (this.calendar_format === "eu") {
                    // If its the first week(first row) and the first_week_day is not in the 
                    // corresponding column(day of week) skip the column                    
                    if (row == 1 && column < first_week_day) {
                        continue;
                    } else if ((row == 1) && (first_week_day == 0) && (column < 7)) {
                        // if it is the first week and the first day of week is a sunday(first_week_day == 0)
                        // and the column is not the one for sunday, skip the column
                        continue;
                    } else if ((row == 1) && (column == 7) && (first_week_day == 0)) {
                        // if the first day of week is a sunday(first_week_day == 0)
                        // and the loop has arrived at the corresponding column

                        // Plot the day number into the calendar cell(span id='calendar-<row>-<column>')
                        let cell = document.getElementById(`calendar-${row}-${column}`);
                        let label = cell.getElementsByClassName('calendar-cell-day-label');

                        label[0].innerHTML = day_number.toString();
                        day_number++;
                        // Continue to the next day
                        continue;
                    }
                } else {
                    // If its the first week(first row) and the first_week_day is not in the 
                    // corresponding column(day of week) skip the column
                    // If the calendar_format is not 'eu' then the english format is used
                    // which means that the weekday slides one column to the left, hence column-1
                    if (row == 1 && (column - 1) < first_week_day) {
                        continue;
                    }
                }
                // If the last day of month has been reached, beak out of the loop
                // there is no more days in the month left
                if (day_number > last_day_of_month) {
                    break;
                }
                // Plot the day number into the calendar cell(span id='calendar-<row>-<column>')
                let cell = document.getElementById(`calendar-${row}-${column}`);
                let label = cell.getElementsByClassName('calendar-cell-day-label');
                let item_list = cell.getElementsByClassName('calendar-cell-item-list');                
                let list_len = this.calendarCellItemLists[day_number].length;

                // If there are any items for this day add them to the list in this cell
                if(list_len > 0){
                    for(let item=0; item < list_len; item++){
                        let li = document.createElement("li");
                        li.innerHTML = this.calendarCellItemLists[day_number][item];
                        item_list[0].appendChild(li);
                    }
                }
                // Plot the day number in the cell
                label[0].innerHTML = day_number.toString();
                // Proceed to the next day
                day_number++;
            }
        }        
    }

    #clearCalendarCells = () => {
        for (let row = 1; row < 7; row++) {
            for (let column = 1; column <= 7; column++) {
                // Clear content of calendar cell(span id='calendar-<row>-<column>')
                let cell = document.getElementById(`calendar-${row}-${column}`);
                let label = cell.getElementsByClassName("calendar-cell-day-label");
                let item_list = cell.getElementsByClassName("calendar-cell-item-list");

                label[0].innerHTML = "...";
                item_list[0].innerHTML = "";
            }
        }
    }
}

// Construct dummy objects of tasks
class TaskObject {
    constructor(id,
        owner,
        is_owner,
        asigned_to,
        title,
        comment,
        due_date,
        category,
        priority,
        status,
        file) {
        this.id = id;
        this.owner = owner;
        this.is_owner = is_owner;
        this.asigned_to = asigned_to;
        this.title = title;
        this.comment = comment,
            this.due_date = due_date;
        this.category = category;
        this.priority = priority;
        this.status = status;
        this.file = file;
    }
}



// The task list for each month should be comprised of an array that is 32 fields long
// The index 0 must remain blank, because there is no day number 0
// Each index of the array corresponds to the number of the day in the given month
// At any one index you have the posibility to store an array of objects for that day
// If the month has less than 31 days, then the remaining indexes will simply remain blank,
// for I chose this layout, because it is more comforatable
// The day number will be extracted and used for fetching the array of task objects sitting
// in the task_list array at the index = day number
function getTaskList(month, year) {
    let task_list = [];
    console.log("getTaskList("+month+","+year+")");

    for (let i = 0; i <= 31; i++) {
        task_list[i] = [];
    }
    
    // task_list[10][0] = new TaskObject("1", "dj", "true", null, "first task", "sadfkjsd", "10. Aug 2023 10:00", "2", "1", "1", "filename");
    // task_list[20][0] = new TaskObject("2", "dj", "true", null, "second task", "sadfkjsd", "20. Aug 2023 10:00", "2", "1", "1", "filename");
    // task_list[20][1] = new TaskObject("3", "dj", "true", null, "third task", "sadfkjsd", "20. Aug 2023 11:00", "2", "1", "1", "filename");
    if (month == 8) {
        task_list[10][0] = "<span class='task-icon'>T8-1</span>";
        task_list[20][0] = "<span class='task-icon'>T8-2</span>";
        task_list[20][1] = "<span class='task-icon'>T8-3</span>";
        
    } else {
        task_list[10][0] = "<span class='task-icon'>TS-1</span>";
        task_list[20][0] = "<span class='task-icon'>TS-2</span>";
        task_list[20][1] = "<span class='task-icon'>TS-3</span>";
        
    }
    
    return task_list;
}
const weekday_names = ["", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let container = document.getElementById("container");
let calendar = new DTECalendar(weekday_names, month_names, container, "en");

function callbackTest(day, month, year) {
    alert("This is the callback :" + day + "." + month + "." + year);
}

calendar.addOnClickCalendarCellListner(callbackTest);
calendar.addOnClickNextMonthListner(getTaskList);
calendar.addOnClickPrevtMonthListner(getTaskList);