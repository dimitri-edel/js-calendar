class EdelCalendar {
    constructor(weekday_names, container, format) {
        // dummy for json fields
        this.json = ["02. Aug 2023 10:00", "02. Aug 2023 11:30", "03 Aug 2023 12:00", "01 Sep 2023 10:00", "02. Sep 20:00", "01. Nov 2023 10:00"];
        // Two formats are supported : en = week begins with sunday, eu = weeks begins with monday        
        this.calendar_format = format;
        // The main container, which will contain all the calendar cells and headings and buttons
        this.calendar_container = document.createElement("div");
        this.calendar_container.id = "calendar-container";
        this.calendar_container.className = "calendar-container";
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
        this.createControlPanel();
        // Append the control panel and the calendar to the HTML-Element that was passed to the contructor
        this.main_container.appendChild(this.control_panel);
        this.main_container.appendChild(this.calendar_container);
        // The first weekday must be blank, so we have natural numbers for weekdays(1,2,3,etc)
        this.weekday_names = weekday_names;
        this.createContainer();

        this.setMonth(this.current_date.getMonth(), this.current_date.getFullYear());
    }
    // Change the list of names for the weekdays, that will be applied to the calendar
    setWeekdayNames = (names_array) => {
        this.weekday_names = names_array;
    }

    createControlPanel = () => {
        let left_button = document.createElement("button");
        left_button.innerHTML = "<<<";
        left_button.addEventListener("click", this.prevMonth);
        this.control_panel.appendChild(left_button);

        let heading = document.createElement("span");
        heading.id = "calendar-heading";
        heading.innerHTML = `${this.current_date.getMonth()} ${this.current_date.getFullYear()}`
        this.control_panel.appendChild(heading);

        let right_button = document.createElement("button");
        right_button.innerHTML = ">>>";
        right_button.addEventListener("click", this.nextMonth);
        this.control_panel.appendChild(right_button);
    }

    nextMonth = () => {
        this.calculateNextMonth();
        this.clearCalendarCells();
        this.setMonth(this.selected_month, this.selected_year);
        console.log(`current year :${this.selected_year} current_month:${this.selected_month}`);
    }

    calculateNextMonth = () => {
        let current_month = this.selected_month;
        if (current_month == 11) {
            this.selected_month = 0;
            this.selected_year++;
        } else {
            this.selected_month++;
        }
    }

    prevMonth = () => {
        this.calculatePrevMonth();
        this.clearCalendarCells();
        this.setMonth(this.selected_month, this.selected_year);
        console.log(`current year :${this.selected_year} current_month:${this.selected_month}`);
    }

    calculatePrevMonth = () => {
        let current_month = this.selected_month;
        if (current_month == 0) {
            this.selected_month = 11;
            this.selected_year--;
        } else {
            this.selected_month--;
        }
    }

    updateElements = () => {

    }

    createContainer = () => {
        let weekdays_row = document.createElement("div");
        weekdays_row.id = "calendar-weekday-names-row";
        weekdays_row.className = "calendar-row";
        this.createWeekdayHeadings(weekdays_row);
        this.calendar_container.appendChild(weekdays_row);

        for (let i = 1; i < 7; i++) {
            let row_elem = document.createElement("div",);
            row_elem.id = `clanendar-row-${i}`;
            row_elem.className = "calendar-row";
            this.createRow(row_elem, i);
            this.calendar_container.appendChild(row_elem);
        }
    }

    createWeekdayHeadings = (row) => {
        for (let i = 1; i <= 7; i++) {
            let span_elem = document.createElement("span");
            span_elem.id = `clanendar-weekday-${i}`;
            span_elem.innerHTML = ` ${this.weekday_names[i]} `;
            row.appendChild(span_elem);
        }
    }

    // Append seven spans to the row and give them an appropriate id='calendar-<row>-<column>'
    createRow = (row, index) => {
        for (let i = 1; i <= 7; i++) {
            let span_elem = document.createElement("span");
            span_elem.id = `calendar-${index}-${i}`;
            span_elem.innerHTML = "...";
            row.appendChild(span_elem);
        }
    }
    // Returns true if the year parameter is a leap year
    isLeapYear(year) {
        return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
    }

    // Returns the number of days in the given month
    getLastDayOfMonth = (month, year) =>{
        // Since months are numbered 0-11, the number of days in each month can
        // be stored in the array, where the index corresponds to the month number
        let days_in_month = new Array();
        days_in_month[0] = 31; // January
        days_in_month[1] = this.isLeapYear(year) ? 29 : 28; // February
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

    // It is imaprative that this method be called after createContainer
    setMonth = (month, year) => {
        // Determine which weekday is the first day of the month
        let first_day = new Date(year, month, 1);
        // Weekdays are numbered 0-6, 0:Sunday, 1:monday, 2:tuesday, etc.
        let first_week_day = first_day.getDay();
        // Find out how many days in the month
        let last_day_of_month = this.getLastDayOfMonth(month, year);

        let day_number = 1;
        console.log(`first_week_day: ${first_week_day}`)

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
                        cell.innerHTML = day_number.toString();
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
                cell.innerHTML = day_number.toString();
                day_number++;
            }
        }
        console.log(`month:${month} year:${year} weekday:${first_week_day}`)
    }

    clearCalendarCells = () => {
        for (let row = 1; row < 7; row++) {
            for (let column = 1; column <= 7; column++) {
                // Plot the day number into the calendar cell(span id='calendar-<row>-<column>')
                let cell = document.getElementById(`calendar-${row}-${column}`);
                cell.innerHTML = "";
            }
        }
    }
}
const weekday_names = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
let container = document.getElementById("container");
let calendar = new EdelCalendar(weekday_names, container, "eu");

