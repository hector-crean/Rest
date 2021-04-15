import * as t from 'io-ts'; 
import * as D from 'io-ts/Decoder'; 

export type MaterialLayers =
  /** services */
  | 'services_wiring'
  | 'services_plumbing'
  | 'services_HVAC'
  | 'services_radiators'

  /** stairs */
  | 'stairs_structural'

  /** envelope section */
  | 'envelope_structure'
  | 'envelope_drywall'

  /** floor  */
  | 'floor_structural'
  | 'floor_surface'
  | 'floor_heating'
  | 'floor_waterproof_membrane'
  | 'floor_thermal_insulation'
  | 'floor_acoustic_insulation'
  | 'floor_vapour_barrier'
  | 'floor_air_barrier'


  /** external wall */
  | 'external_wall_structural'
  | 'external_wall_waterproof_membrane'
  | 'external_wall_thermal_insulation'
  | 'external_wall_acoustic_insulation'
  | 'external_wall_vapour_barrier'
  | 'external_wall_air_barrier'
  | 'external_wall_internal_batten'
  | 'external_wall_cladding'
  | 'external_wall_drywall'
  | 'external_wall_panelling'
  | 'external_wall_skirting'
  | 'external_wall_door_frame'
  | 'external_wall_door'
  | 'external_wall_door_handle'
  | 'external_wall_window_frame'
  | 'external_wall_window_glass'

  /** internal wall */
  | 'internalwall_structure'
  | 'internalwall_door_handle'
  | 'internalwall_door'

  /** roof  */
  | 'roof_structural'
  | 'roof_waterproof_membrane'
  | 'roof_thermal_insulation'
  | 'roof_acoustic_insulation'
  | 'roof_vapour_barrier'
  | 'roof_air_barrier'
  | 'roof_internal_batten'   /** A batten is most commonly a strip of solid material, historically wood */
  | 'roof_cladding'
  | 'roof_ridge_vents'
  | 'roof_flashing'
  | 'roof_drywall'  /* --Drywall (also known as plasterboard, wallboard, sheet rock, gypsum board, buster board, custard board, or gypsum panel) */
  | 'roof_drainage_gutter'
  | 'roof_drainage_drainpipe'
  | 'roof_window_frame'
  | 'roof_window_glass'
  | 'roof_window_handle'

  /** furniture  */
  | 'furniture'

  | 'fittings_kitchen_units'
  | 'fittings_joinery'


export type MaterialType =
  | 'glass'
  | 'wood/ash'
  | 'wood/oak'
  | 'wood/plywood'
  | 'metal/zinc'
  | 'plaster'
  | 'insulation/thermal'
  | 'insulation/acoustic'
  | 'barrier/vapour'
  | 'barrier/air'
  | 'barrier/water'
  | 'placeholder'




type Attachment = Array<{id: string; url: string; filename: string} & {[key: string]: any}>
const attachmentCodec: t.Type<Attachment> = t.array(t.interface({id: t.string, url: t.string, filename: t.string}))

export type Material = Partial<{
    name: string;
    source: string;
    layer: string;
    category: string[];
    use: string[];
    _TEXTURE: Attachment;
    _BUMP: Attachment;
    _GLOSS: Attachment;
    _NORM: Attachment;
    _DISPLACEMENT: Attachment;
    _METALNESS: Attachment;
    _SPECULARITY: Attachment;
    _AO: Attachment;
    _ROUGHNESS: Attachment;
    _REFL: Attachment;
  }>;

  export const materialCodec: t.Type<Material> = t.partial({
    name: t.string,
    source: t.string,
    layer: t.string,
    category: t.array(t.string),
    use: t.array(t.string),
    _TEXTURE: attachmentCodec,
    _BUMP: attachmentCodec,
    _GLOSS: attachmentCodec,
    _NORM: attachmentCodec,
    _DISPLACEMENT: attachmentCodec,
    _METALNESS: attachmentCodec,
    _SPECULARITY: attachmentCodec,
    _AO: attachmentCodec,
    _ROUGHNESS: attachmentCodec,
    _REFL: attachmentCodec,
  })








