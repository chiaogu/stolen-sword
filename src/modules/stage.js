import { setStage, nextStage } from '../helper/stage'; 


window.addEventListener('keydown', ({ key }) => {
  if (key === '1') setStage(0);
  if (key === '2') setStage(1);
});

nextStage();

export default () => {
};
