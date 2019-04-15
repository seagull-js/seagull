import { Omit } from 'lodash'
import { Helmet as H, HelmetData as HData, HelmetDatum } from 'react-helmet'

export interface HelmetData
  extends Omit<HData, 'bodyAttributes' | 'htmlAttributes'> {}

export const Helmet = H
