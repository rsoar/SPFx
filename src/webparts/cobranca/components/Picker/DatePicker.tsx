import * as React from 'react';
import { useState } from 'react';
import { IDatePickerProps ,DatePicker, DayOfWeek, TextField } from 'office-ui-fabric-react';

function DatePickerBasicExample(props: IDatePickerProps) {
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(DayOfWeek.Sunday);

  return (
      <DatePicker
        firstDayOfWeek={firstDayOfWeek}
        placeholder="Selecione uma data"
        ariaLabel="Selecione uma data"
        {...props}
      />
  );
};

export default DatePickerBasicExample;