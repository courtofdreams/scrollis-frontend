import {
  TransitionPresets,
  CardStyleInterpolators,
  HeaderStyleInterpolators,
} from '@react-navigation/stack';

// Available presets
const presets = {
  SlideFromRightIOS: TransitionPresets.SlideFromRightIOS,
  ModalSlideFromBottomIOS: TransitionPresets.ModalSlideFromBottomIOS,
  ModalPresentationIOS: TransitionPresets.ModalPresentationIOS,
  FadeFromBottomAndroid: TransitionPresets.FadeFromBottomAndroid,
  RevealFromBottomAndroid: TransitionPresets.RevealFromBottomAndroid,
  ScaleFromCenterAndroid: TransitionPresets.ScaleFromCenterAndroid,
  DefaultTransition: TransitionPresets.DefaultTransition,
  ModalTransition: TransitionPresets.ModalTransition,
};