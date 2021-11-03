import * as React from 'react';
import { useState } from 'react';
import { IDatePickerProps, DatePicker, DayOfWeek, TextField, IDropdownOption } from 'office-ui-fabric-react';

function DatePickerBasic(props: IDatePickerProps) {

  return (
      <DatePicker
        placeholder={'Selecione uma data'}
        ariaLabel="Selecione uma data"
        {...props}
      />
  );
};

export default DatePickerBasic;