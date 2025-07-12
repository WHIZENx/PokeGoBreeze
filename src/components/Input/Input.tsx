import React from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { IInputComponent } from '../models/component.model';
import { LabelType } from '../../enums/type.enum';
import { isUndefined } from '../../utils/extension';
import { VariantType } from '../../enums/type.enum';

const Input = (props: IInputComponent) => {
  return (
    <>
      {props.label && <Form.Label>{props.label}</Form.Label>}
      <InputGroup size={props.size} className={props.className}>
        {props.prepend?.map(
          (item, index) =>
            ((isUndefined(item.type) || item.type === LabelType.Text) && (
              <InputGroup.Text key={index} className={item.className} onClick={item.onClick}>
                {item.value}
              </InputGroup.Text>
            )) ||
            (item.type === LabelType.Button && (
              <Button
                variant={item.variant || VariantType.OutlinedSecondary}
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
            {...control}
            size={undefined}
            value={control.value as string | number | string | undefined}
            as={control.isTextarea ? 'textarea' : 'input'}
            type={control.type || 'text'}
            autoComplete={control.autoComplete || 'off'}
          />
        ))}
        {props.append?.map(
          (item, index) =>
            ((isUndefined(item.type) || item.type === LabelType.Text) && (
              <InputGroup.Text key={index} className={item.className} onClick={item.onClick}>
                {item.value}
              </InputGroup.Text>
            )) ||
            (item.type === LabelType.Button && (
              <Button
                variant={item.variant || VariantType.OutlinedSecondary}
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
