import { PrimaryButton, SecondaryButton } from '@components/buttons';
import { Editor } from '@components/editor';
import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { assertUnreachable } from '@utils/assertUnreachable';
import { useDialogsRef } from '@hooks/useDialogsRef';
import React, { FormEventHandler, forwardRef, useMemo, useRef, useState } from 'react';
import { Select } from './Select';
import { SelectContainerWithLabel } from '@components/selects/SelectContainerWithLabel';
import { useZodForm } from '@hooks/useZodForm';
import { z } from 'zod';

export const SelectEditorOverlay = defineEditorOverlay<'dialog', {}>('SelectExampleOverlay', (dialogToShow, handleCloseRef, closeDialog, props) => {
  switch (dialogToShow) {
    case 'dialog':
      return <SelectDialog ref={handleCloseRef} closeDialog={closeDialog} />;
    default:
      return assertUnreachable(dialogToShow);
  }
});

const genericOptions = [
  { value: 'value_a', label: 'Option A' },
  { value: 'value_b', label: 'Choice B' },
  { value: 'value_c', label: 'Very long stuff C that needs tooltip', tooltip: 'Very long stuff C that needs tooltip' },
  { value: 'value_d', label: 'Option D' },
  { value: 'value_e', label: 'Choice E' },
  { value: 'value_f', label: 'Choice F' },
  { value: 'value_g', label: 'Option G' },
] as const;
type GenericOptionValue = (typeof genericOptions)[number]['value'];

export const SelectExamples = () => {
  const dialogsRef = useDialogsRef<'dialog'>();

  return (
    <div style={{ padding: '32px', width: '100%', overflow: 'auto' }}>
      <h2>Controlled selects</h2>
      <ControlledSelects />
      <p>Note: Tooltip is not yet on steroid so they don't show but they will show once they under steroid!</p>
      <br />
      <h2>Select like ControlBar</h2>
      <SelectContainerWithLabel>
        <span>Options</span>
        <Select options={genericOptions} defaultValue="value_c" notFoundLabel={'Not found'} />
      </SelectContainerWithLabel>
      <br />
      <h2>With disabled effect</h2>
      <PotentiallyDisabledComponent />
      <br />
      <h2>Test dialogs</h2>
      <PrimaryButton onClick={() => dialogsRef.current?.openDialog('dialog')}>Open Dialog</PrimaryButton>
      <SelectEditorOverlay ref={dialogsRef} />
      <h2 style={{ marginTop: '10vh' }}>Uncontrolled selects</h2>
      <UncontrolledSelects />
    </div>
  );
};

const ControlledSelects = () => {
  const [value1, setValue1] = useState<GenericOptionValue | 'choose'>('choose');
  const [value2, setValue2] = useState<GenericOptionValue>('invalid' as unknown as GenericOptionValue);
  const [value3, setValue3] = useState<GenericOptionValue>('value_d');

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <InputContainer size="s">
        <InputWithTopLabelContainer>
          <Label>Nothing selected</Label>
          <Select value={value1} options={genericOptions} chooseValue="choose" placeholder="Choose a value" onChange={setValue1} />
          <button onClick={() => setValue1('choose')}>Reset</button>
        </InputWithTopLabelContainer>
      </InputContainer>
      <InputContainer size="s">
        <InputWithTopLabelContainer>
          <Label>Invalid selection</Label>
          <Select value={value2} options={genericOptions} notFoundLabel="Value not found" onChange={setValue2} />
          <button onClick={() => setValue2('invalid' as unknown as GenericOptionValue)}>Make invalid</button>
        </InputWithTopLabelContainer>
      </InputContainer>
      <InputContainer size="s">
        <InputWithTopLabelContainer>
          <Label>Normal selection</Label>
          <Select value={value3} options={genericOptions} onChange={setValue3} />
        </InputWithTopLabelContainer>
      </InputContainer>
    </div>
  );
};

const UncontrolledSelects = () => {
  const ref1 = useRef<string | undefined>();
  const ref2 = useRef<string | undefined>();
  const bigOptions = Array.from({ length: 2000 }, (_, i) => ({ value: `value_${i}`, label: `Option ${i}` }));

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      <InputContainer size="s">
        <InputWithLeftLabelContainer>
          <Label>Nothing</Label>
          <Select options={bigOptions} placeholder="Choose a value" optionRef={ref1} />
          <button onClick={() => alert(`Value: ${ref1.current}`)}>Show Value</button>
        </InputWithLeftLabelContainer>
      </InputContainer>
      <InputContainer size="s">
        <InputWithLeftLabelContainer>
          <Label>Normal</Label>
          <Select options={bigOptions} placeholder="Choose a value" defaultValue="value_1023" optionRef={ref2} />
          <button onClick={() => alert(`Value: ${ref2.current}`)}>Show Value</button>
        </InputWithLeftLabelContainer>
      </InputContainer>
    </div>
  );
};

const PotentiallyDisabledComponent = () => {
  const [value1, setValue1] = useState<GenericOptionValue | 'choose'>('choose');
  const [value2, setValue2] = useState<GenericOptionValue | 'choose'>('choose');
  const [value3, setValue3] = useState<GenericOptionValue | 'choose'>('choose');
  const options = useMemo(() => genericOptions.slice(0, 2), []);
  const options1 = options.filter(({ value }) => value !== value2 && value !== value3);
  const options2 = options.filter(({ value }) => value !== value1 && value !== value3);
  const options3 = options.filter(({ value }) => value !== value1 && value !== value2);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <InputContainer size="s">
        <InputWithTopLabelContainer>
          <Label>Choice 1</Label>
          <Select value={value1} options={options1} chooseValue="choose" placeholder="Choose a value" onChange={setValue1} />
          <button onClick={() => setValue1('choose')}>Reset</button>
        </InputWithTopLabelContainer>
      </InputContainer>
      <InputContainer size="s">
        <InputWithTopLabelContainer>
          <Label>Choice 2</Label>
          <Select value={value2} options={options2} placeholder="Choose a value" onChange={setValue2} />
          <button onClick={() => setValue2('choose')}>Reset</button>
        </InputWithTopLabelContainer>
      </InputContainer>
      <InputContainer size="s">
        <InputWithTopLabelContainer>
          <Label>Choice 3</Label>
          <Select value={value3} options={options3} placeholder="Choose a value" onChange={setValue3} />
          <button onClick={() => setValue3('choose')}>Reset</button>
        </InputWithTopLabelContainer>
      </InputContainer>
    </div>
  );
};

const FORM_SCHEMA = z.object({
  nothing: z.string(),
  normal: z.string(),
  test: z.number().int(),
  array: z.array(
    z.union([
      z.string().min(1),
      z.object({
        a: z.string(),
        b: z.string(),
        c: z.array(z.number().int()),
      }),
    ])
  ),
});

const SelectDialog = forwardRef<EditorHandlingClose, { closeDialog: () => void }>(({ closeDialog }, ref) => {
  const dialogsRef = useDialogsRef<'dialog'>();
  useEditorHandlingClose(ref);
  const v = useZodForm(FORM_SCHEMA, { normal: 'value_e', test: 6, array: ['string1', 'string2', { a: 'obj_a', b: 'obj_b', c: [-5, 7] }] });
  const defaults = v.defaults;
  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData);
    alert(JSON.stringify(v.getFormData()));
    alert(JSON.stringify(values));
  };
  console.log(v);

  return (
    <Editor type="studio" title={'Dialog'}>
      <form onSubmit={onSubmit} ref={v.formRef}>
        <InputContainer size="s">
          <InputWithTopLabelContainer>
            <Label>Nothing selected</Label>
            <Select
              options={genericOptions}
              chooseValue="choose"
              placeholder="Choose a value"
              name="nothing"
              onChange={(value) => v.onTouched('nothing', true, value)}
            />
          </InputWithTopLabelContainer>
          <InputWithLeftLabelContainer>
            <Label>Normal</Label>
            <Select options={genericOptions} chooseValue="choose" placeholder="Choose a value" defaultValue={defaults.normal} name="normal" />
          </InputWithLeftLabelContainer>
          <button type="submit">Submit</button>
        </InputContainer>
        <input name="test" type="number" defaultValue={defaults.test} onInput={v.onInputTouched} />
        <input name="array.0" type="text" defaultValue={defaults['array.0']} onInput={v.onInputTouched} pattern="^string\d$" />
        <input name="array.1" type="text" defaultValue={defaults['array.1']} onInput={v.onInputTouched} />
        <input name="array.2.a" type="text" defaultValue={defaults['array.2.a']} onInput={v.onInputTouched} />
        <input name="array.2.b" type="text" defaultValue={defaults['array.2.b']} onInput={v.onInputTouched} />
        <input name="array.2.c.0" type="number" defaultValue={defaults['array.2.c.0']} onInput={v.onInputTouched} />
        <input name="array.2.c.1" type="number" defaultValue={defaults['array.2.c.1']} onInput={v.onInputTouched} />
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '32px' }}>
        <SecondaryButton onClick={() => dialogsRef.current?.openDialog('dialog', true)}>Sub dialog centered</SecondaryButton>
        <SecondaryButton onClick={() => dialogsRef.current?.openDialog('dialog')}>Sub dialog on right</SecondaryButton>
        <PrimaryButton onClick={closeDialog}>Close</PrimaryButton>
      </div>
      <SelectEditorOverlay ref={dialogsRef} />
    </Editor>
  );
});
SelectDialog.displayName = 'SelectDialog';
