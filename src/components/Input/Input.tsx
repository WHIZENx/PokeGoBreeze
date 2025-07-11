import React from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { IInputComponent } from '../models/component.model';
import { LabelType } from '../../enums/type.enum';

const Input = (props: IInputComponent) => {
  return (
    <>
      {props.label && <Form.Label>{props.label}</Form.Label>}
      <InputGroup size={props.size} className={props.className}>
        {props.prepend?.map(
          (item, index) =>
            (item.type === LabelType.Text && (
              <InputGroup.Text key={index} className={item.className} onClick={item.onClick}>
                {item.value}
              </InputGroup.Text>
            )) ||
            (item.type === LabelType.Button && (
              <Button
                variant={item.variant || 'outline-secondary'}
                key={index}
                onClick={item.onClick}
                className={item.className}
                disabled={item.disabled}
              >
                {item.value}
              </Button>
            ))
        )}
        {props.controls?.map((control, index) => (
          <Form.Control
            key={index}
            placeholder={control.placeholder}
            value={control.value as string | number | string | undefined}
            onChange={control.onChange}
            onKeyDown={control.onKeyDown}
            onKeyUp={control.onKeyUp}
            onFocus={control.onFocus}
            onBlur={control.onBlur}
            className={control.className}
            as={control.isTextarea ? 'textarea' : 'input'}
            disabled={control.disabled}
            readOnly={control.readOnly}
            autoComplete={control.autoComplete || 'off'}
          />
        ))}
        {props.append?.map(
          (item, index) =>
            (item.type === LabelType.Text && (
              <InputGroup.Text key={index} className={item.className} onClick={item.onClick}>
                {item.value}
              </InputGroup.Text>
            )) ||
            (item.type === LabelType.Button && (
              <Button
                variant={item.variant || 'outline-secondary'}
                key={index}
                onClick={item.onClick}
                className={item.className}
                disabled={item.disabled}
              >
                {item.value}
              </Button>
            ))
        )}
      </InputGroup>
    </>
  );
};

export default Input;
