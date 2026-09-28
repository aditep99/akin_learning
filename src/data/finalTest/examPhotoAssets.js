import {getFinalTestPhotoAsset} from './finalTestPhotoAssets';
import {sciencePhotoAssets} from '../subjects/sciencePhotoAssets';
export function getExamPhotoAsset(id) {
  return getFinalTestPhotoAsset(id) || sciencePhotoAssets.find(asset=>asset.assetId===id) || null;
}
export function plantPhotoId(part) {
  return sciencePhotoAssets.find(asset=>asset.wordId==='plant-'+part)?.assetId;
}
