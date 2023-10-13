import { useState } from 'react';

import { type SelectOption,Select } from './components/Select';

const options: SelectOption[] = [
  {
    label: 'First',
    value: 1,
  },
  {
    label: 'Second',
    value: 2,
  },
  {
    label: 'Third',
    value: 3,
  },
  {
    label: 'Fourth',
    value: 4,
  },
  {
    label: 'Fifth',
    value: 5,
  },
];

function App() {
  const [value1, setValue1] = useState<typeof options[0] | undefined>(
    options[0]
  );
  const [value2, setValue2] = useState<typeof options>([options[0]]);
  return (
    <>
      <div className={'prose max-w-none'}>
        <br />
        <div className="mt-16 container mx-auto">
          <Select
            options={options}
            value={value1}
            onChange={(option) => {
              setValue1(option);
            }}
          />
          <br />
          <br />
          <Select
            multiple
            options={options}
            value={value2}
            onChange={(option) => {
              setValue2(option);
            }}
          />
        </div>
      </div>
    </>
  );
}

export default App;
