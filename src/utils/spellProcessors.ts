
export const parseComponents = (componentStr: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration?: boolean;
} => {
  return {
    verbal: componentStr.includes('В'),
    somatic: componentStr.includes('С'),
    material: componentStr.includes('М'),
    ritual: componentStr.includes('Р'),
    concentration: componentStr.includes('К')
  };
};
