import * as React from 'react';
import { FunctionComponent } from 'react';
import update from 'immutability-helper';

import { useGlobalState } from '../../../GlobalStateProvider';
import PSDKEntity from '../../../models/entities/PSDKEntity';

const ExampleComponent: FunctionComponent<PSDKEntity> = ({
  id,
}: PSDKEntity) => {
  const [state, setState] = useGlobalState();
  const increment = () => {
    setState((prev) =>
      update(prev, {
        projectData: {
          examples: { [id]: { foo: { $apply: (x: number) => x + 1 } } },
        },
      })
    );
  };
  return (
    <div>
      <span>Foo: {state.projectData.examples[id].foo}</span>
      <button type="button" onClick={increment}>
        +1
      </button>
    </div>
  );
};

export default ExampleComponent;
