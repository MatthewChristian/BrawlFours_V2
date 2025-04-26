import React, { useEffect, useState } from 'react';


interface Props {
  label?: string;
  onChange?: (val: number) => void;
  defaultValue?: number;
}


export default function Slider({ onChange, label, defaultValue }: Props ) {

  const [sliderValue, setSliderValue] = useState<number>();

  function handleChange(val: number) {
    setSliderValue(val);

    if (onChange) {
      onChange(val);
    }
  }

  useEffect(() => {
    setSliderValue(defaultValue);
  }, [defaultValue]);

  return (
    <div className='flex flex-row gap-2'>
      <div>{label}</div>
      <input className='relative bottom-[1px]' type="range" min="0" max="100" step={5} defaultValue={sliderValue} onChange={(e) => handleChange(Number(e.currentTarget.value))}></input>
      <div className='w-5'>{sliderValue}</div>
    </div>
  );
}
