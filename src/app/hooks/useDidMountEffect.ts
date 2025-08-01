import { useEffect, useRef } from 'react';

const useDidMountEffect = (func: () => void, deps: React.DependencyList) => {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) func();
    else didMount.current = true;
  }, deps);
};
/* eslint-disable */

export default useDidMountEffect;