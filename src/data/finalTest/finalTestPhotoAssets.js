import classBag from "../../assets/final-test/photo/class-bag.jpg";
import classBook from "../../assets/final-test/photo/class-book.jpg";
import classChair from "../../assets/final-test/photo/class-chair.jpg";
import classCrayon from "../../assets/final-test/photo/class-crayon.jpg";
import classPencil from "../../assets/final-test/photo/class-pencil.jpg";
import classRuler from "../../assets/final-test/photo/class-ruler.jpg";
import colorBlueBall from "../../assets/final-test/photo/color-blue-ball.jpg";
import colorGreenLeaf from "../../assets/final-test/photo/color-green-leaf.jpg";
import colorRedApple from "../../assets/final-test/photo/color-red-apple.jpg";
import colorYellowBalloon from "../../assets/final-test/photo/color-yellow-balloon.jpg";
import familyInupiat from "../../assets/final-test/photo/family-inupiat.jpg";
import phonicsBrush from "../../assets/final-test/photo/phonics-brush.jpg";
import phonicsDuck from "../../assets/final-test/photo/phonics-duck.jpg";
import shapeCircle from "../../assets/final-test/photo/shape-circle.jpg";
import shapeRectangle from "../../assets/final-test/photo/shape-rectangle.jpg";
import shapeSquare from "../../assets/final-test/photo/shape-square.jpg";
import shapeTriangle from "../../assets/final-test/photo/shape-triangle.jpg";
import toyBall from "../../assets/final-test/photo/toy-ball.jpg";
import toyBlocks from "../../assets/final-test/photo/toy-blocks.jpg";
import toyCar from "../../assets/final-test/photo/toy-car.jpg";
import toyDoll from "../../assets/final-test/photo/toy-doll.jpg";
import toyPlane from "../../assets/final-test/photo/toy-plane.jpg";
import toyPuzzle from "../../assets/final-test/photo/toy-puzzle.jpg";
import toyRobot from "../../assets/final-test/photo/toy-robot.jpg";
import toyTeddy from "../../assets/final-test/photo/toy-teddy.jpg";
import transportBicycle from "../../assets/final-test/photo/transport-bicycle.jpg";
import transportBoat from "../../assets/final-test/photo/transport-boat.jpg";
import transportBus from "../../assets/final-test/photo/transport-bus.jpg";
import transportCar from "../../assets/final-test/photo/transport-car.jpg";
import transportPlane from "../../assets/final-test/photo/transport-plane.jpg";
import transportTrain from "../../assets/final-test/photo/transport-train.jpg";

const reviewedAt = "2026-09-07";

const fileHashes = {
  "class-bag": "4e8f0ccc180d79cb1b33433dc26212650ca58b40a299f715851ed47224c23c6c",
  "class-book": "99170741beb4dd892a103f8615749f122090397f84aa5d77dc9d68248eb32c24",
  "class-chair": "25464f9cb7641ea8c2f8acc4b42ec2e66bb7869d284addf31f7102b4885ae18d",
  "class-crayon": "8c970af9e416133262785f57601e42de859e6679a270491e675ae5ff4658cb5d",
  "class-pencil": "4ea3a28407435dc63e8afb92153d0e7dee142e3fded1f29a06bf1e6491254a0e",
  "class-ruler": "2f3346117d1cf19ca2852e23a205e04558f9f3f49498f0a824fed96357f59b6a",
  "color-blue-ball": "ef32b7aa99047355c804f9996c895e6a2d6a4c910367b83821384ca5c14517b9",
  "color-green-leaf": "df8e0a904962bcd04cdde0fce6ba21e55620223585dcad3eb4a9767dabbe365f",
  "color-red-apple": "8ffffb18dde498be0462c8ddbd5720b7e2243d3dc76f41197a49fc06fab0164a",
  "color-yellow-balloon": "682a84e7968e244953bf64e6737d96248ecbddee862d70906ede41e0eda8b9d1",
  "family-inupiat": "b389639b3166a48d5e5eca76086d98d5d12db0cfc4fee5664b0b6401c00d39ad",
  "phonics-brush": "67765f948a0746c76dc3d4ffdccb81249d6bb9aa591ba485c1758ab0ed909027",
  "phonics-duck": "fca9adefd43ca12e3dedb6f9c3a63454060a51e055976b2c11794ae36d5e6546",
  "shape-circle": "ef32b7aa99047355c804f9996c895e6a2d6a4c910367b83821384ca5c14517b9",
  "shape-rectangle": "99170741beb4dd892a103f8615749f122090397f84aa5d77dc9d68248eb32c24",
  "shape-square": "4a7ce7e6370b387129b927efe345ef3f1b2962e916371800328962d786788fe9",
  "shape-triangle": "e9765e95d0ee288d64a286b66b4cc140f6a090b676fc1e8f7c8e1880e4616768",
  "toy-ball": "ef32b7aa99047355c804f9996c895e6a2d6a4c910367b83821384ca5c14517b9",
  "toy-blocks": "4a7ce7e6370b387129b927efe345ef3f1b2962e916371800328962d786788fe9",
  "toy-car": "6afc6b49ee3cc547ab3703290fd20a106e9f64d83ba76b89bb96fa9e775d03ee",
  "toy-doll": "d75746faedd505ad39ae2258f67bba97fea23f163ce0b51936b8802400419439",
  "toy-plane": "fd7c1c0a055327ce67e53cb84a8f208a8b5ad4495dc737c6cfacaaeef6e277f3",
  "toy-puzzle": "40b90e0bccd79f3b7ede99d5da4e883c1f666e13ca73e620a4a95d31b7b87284",
  "toy-robot": "f2d05da360c6bd1e9508602bb5c4dac1a1240424dd7fce1a1b342ac842be9cd5",
  "toy-teddy": "a0509e51e99f02c91120b5646b6d74d0c89fefbaa9b3818ff2ed3fc5ca0d66c8",
  "transport-bicycle": "5b23ee2023fcc1ca729611c083f96f29dad8b4f42aaf3d87fdb95f921af4497f",
  "transport-boat": "220e410e50493cbfd445ca09f038d7c7a1b35ba7f57e0b1453fabd96e813e6bb",
  "transport-bus": "b4c61cd5db87e5844ff91195fe957b85e70595c03e0366a6ced6330c6c13e3aa",
  "transport-car": "14588e6826c248da43f9b9e54dbb79e640a30df52cff71613c08118f9f550b05",
  "transport-plane": "c9e296fc18f0edb55300a4a330f0804f01d48826b1528f0427ab729d050b3a27",
  "transport-train": "a1e271eff8d6e4c48d6312ad99f35f3b2634aa66f774a66d2279210da8cf9227",
};

const sourceRecords = {
  "class-pencil": {
    license: "CC0 1.0",
    creator: "Pixabay",
    sourceTitle: "Pencil on White Paper",
    sourceUrl: "https://www.pexels.com/photo/pencil-on-white-paper-159752/",
    sourceAssetUrl:
      "https://images.pexels.com/photos/159752/pencil-office-design-creative-159752.jpeg?cs=srgb&dl=pexels-pixabay-159752.jpg&fm=jpg",
    sourceWidth: 3888,
    sourceHeight: 2592,
    transform: "center crop and resize to 1024x768",
  },
  "phonics-brush": {
    license: "CC0 1.0",
    creator: "Karolina Grabowska",
    sourceTitle: "Brush painting the white wall",
    sourceUrl: "https://www.pexels.com/photo/brush-painting-the-white-wall-6368/",
    sourceAssetUrl:
      "https://images.pexels.com/photos/6368/art-wall-brush-painting.jpg?cs=srgb&dl=pexels-karola-g2-6368.jpg&fm=jpg",
    sourceWidth: 4734,
    sourceHeight: 3156,
    transform: "crop out the adjacent map edge, then resize to 1024x768",
  },
  "family-inupiat": {
    license: "Public domain",
    creator: "Edward S. Curtis",
    sourceTitle: "Inupiat Family from Noatak, Alaska, 1929 (restored)",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Inupiat_Family_from_Noatak,_Alaska,_1929,_Edward_S._Curtis_(restored).jpg",
    sourceAssetUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/8c/Inupiat_Family_from_Noatak%2C_Alaska%2C_1929%2C_Edward_S._Curtis_%28restored%29.jpg",
  },
  "transport-bus": {
    license: "CC0 1.0",
    creator: "MarkBuckawicki",
    sourceTitle: "Public Bus in Nashua",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Public_Bus_in_Nashua.JPG",
    sourceAssetUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/52/Public_Bus_in_Nashua.JPG",
  },
  "transport-train": {
    license: "CC0 1.0",
    creator: "Jason Goh",
    sourceTitle: "Train passing through Maeklong Railway Market",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Train_passing_through_Maeklong_Railway_Market_(public_domain).jpg",
    sourceAssetUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/81/Train_passing_through_Maeklong_Railway_Market_%28public_domain%29.jpg",
  },
  "transport-boat": {
    license: "CC0 1.0",
    creator: "Bernard Gagnon",
    sourceTitle: "Boat on Baengmagang River 01",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Boat_on_Baengmagang_River_01.jpg",
    sourceAssetUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/3c/Boat_on_Baengmagang_River_01.jpg",
  },
  "transport-bicycle": {
    license: "CC0 1.0",
    creator: "MZaki",
    sourceTitle: "Bicycle YOSANO Akiko",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Bicycle_YOSANO_Akiko.jpg",
    sourceAssetUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/b2/Bicycle_YOSANO_Akiko.jpg",
  },
  "toy-car": {
    license: "CC0 1.0",
    creator: "Alf van Beem",
    sourceTitle: "Soft plastic toy car",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Soft_plastic_toy_car.JPG",
    sourceAssetUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/8a/Soft_plastic_toy_car.JPG",
    sourceWidth: 1457,
    sourceHeight: 1947,
    transform: "portrait source center crop and resize to 1024x768",
  },
  "toy-doll": {
    license: "CC0 1.0",
    creator: "Pixabay",
    sourceTitle: "Brown-haired female doll",
    sourceUrl: "https://www.pexels.com/photo/brown-haired-female-doll-207923/",
    sourceAssetUrl:
      "https://images.pexels.com/photos/207923/pexels-photo-207923.jpeg?cs=srgb&dl=pexels-pixabay-207923.jpg&fm=jpg",
    sourceWidth: 5528,
    sourceHeight: 3854,
    transform: "center crop and resize to 1024x768",
  },
  "toy-plane": {
    license: "CC0 1.0",
    creator: "Claudette Gallant",
    sourceTitle: "Toy Airplane",
    sourceUrl:
      "https://www.publicdomainpictures.net/en/view-image.php?image=96408&picture=toy-airplane",
    sourceAssetUrl:
      "https://www.publicdomainpictures.net/pictures/100000/velka/avion-jouet.jpg",
    sourceWidth: 1920,
    sourceHeight: 1257,
    transform: "crop to the large left toy plane, then resize to 1024x768",
  },
  "toy-robot": {
    license: "CC0 1.0",
    creator: "Karolina Grabowska",
    sourceTitle: "Wooden Robot",
    sourceUrl: "https://www.pexels.com/photo/wooden-robot-6069/",
    sourceAssetUrl:
      "https://images.pexels.com/photos/6069/grass-lawn-green-wooden-6069.jpg?cs=srgb&dl=pexels-karola-g2-6069.jpg&fm=jpg",
    sourceWidth: 5118,
    sourceHeight: 3412,
    transform: "center crop and resize to 1024x768",
  },
  "toy-teddy": {
    license: "CC0 1.0",
    creator: "Pixabay",
    sourceTitle: "Gray Bear Plush Toy",
    sourceUrl: "https://www.pexels.com/photo/gray-bear-plush-toy-264907/",
    sourceAssetUrl:
      "https://images.pexels.com/photos/264907/pexels-photo-264907.jpeg?cs=srgb&dl=pexels-pixabay-264907.jpg&fm=jpg",
    sourceWidth: 5472,
    sourceHeight: 3648,
    transform: "center crop and resize to 1024x768",
  },
  "shape-triangle": {
    license: "CC0 1.0",
    creator: "ClickerHappy",
    sourceTitle: "Yellow Slippery Road Signage",
    sourceUrl: "https://www.pexels.com/photo/sign-slippery-wet-caution-4341/",
    sourceAssetUrl:
      "https://images.pexels.com/photos/4341/sign-slippery-wet-caution.jpg?cs=srgb&dl=pexels-clickerhappy-4341.jpg&fm=jpg",
    sourceWidth: 5193,
    sourceHeight: 3462,
    transform: "center crop and resize to 1024x768",
  },
  "transport-plane": {
    license: "CC0 1.0",
    creator: "Pixabay",
    sourceTitle: "Grey Airbus Airplane Under White and Blue Sky",
    sourceUrl:
      "https://www.pexels.com/photo/grey-airbus-airplane-under-white-and-blue-sky-53602/",
    sourceAssetUrl:
      "https://images.pexels.com/photos/53602/airplane-plane-transportation-landing-53602.jpeg?cs=srgb&dl=pexels-pixabay-53602.jpg&fm=jpg",
    sourceWidth: 3888,
    sourceHeight: 2592,
    transform: "center crop and resize to 1024x768",
  },
};

const inheritedPhotoSource = {
  license: "CC0 1.0",
  creator: "AkinLearning photo pack",
  sourceTitle: "AkinLearning reviewed classroom and toy photograph",
  sourceUrl: "https://github.com/openai/akinlearning-assets",
  sourceAssetUrl: "https://github.com/openai/akinlearning-assets",
};

const definitions = [
  ["class-book", classBook, "A single blue book on a light background", "book"],
  ["class-pencil", classPencil, "A single wooden pencil", "pencil"],
  ["class-ruler", classRuler, "A single ruler on a light background", "ruler"],
  ["class-bag", classBag, "A school bag on a light background", "bag"],
  ["class-chair", classChair, "A single classroom chair", "chair"],
  ["class-crayon", classCrayon, "A single coloured crayon", "crayon"],
  ["color-red-apple", colorRedApple, "A single red apple", "red"],
  ["color-green-leaf", colorGreenLeaf, "A single green leaf", "green"],
  ["color-blue-ball", colorBlueBall, "A blue and white ball", "blue"],
  ["color-yellow-balloon", colorYellowBalloon, "A yellow balloon", "yellow"],
  ["family-inupiat", familyInupiat, "A family with two adults and a child", "family"],
  ["toy-ball", toyBall, "A colourful ball toy", "ball"],
  ["toy-blocks", toyBlocks, "A set of building blocks", "blocks"],
  ["toy-car", toyCar, "A small toy car", "toy-car"],
  ["toy-doll", toyDoll, "A single doll", "doll"],
  ["toy-plane", toyPlane, "A single toy plane", "toy-plane"],
  ["toy-puzzle", toyPuzzle, "A jigsaw puzzle", "puzzle"],
  ["toy-robot", toyRobot, "A toy robot", "robot"],
  ["toy-teddy", toyTeddy, "A teddy bear toy", "teddy-bear"],
  ["transport-car", transportCar, "A car on the road", "car"],
  ["transport-bicycle", transportBicycle, "A bicycle", "bicycle"],
  ["transport-plane", transportPlane, "A single airplane", "plane"],
  ["transport-bus", transportBus, "A city bus", "bus"],
  ["transport-train", transportTrain, "A passenger train", "train"],
  ["transport-boat", transportBoat, "A boat on a river", "boat"],
  ["phonics-duck", phonicsDuck, "A duck", "duck"],
  ["phonics-brush", phonicsBrush, "A single paintbrush", "brush"],
  ["shape-circle", shapeCircle, "A round ball showing a circle", "circle"],
  ["shape-square", shapeSquare, "Square building blocks", "square"],
  ["shape-rectangle", shapeRectangle, "A rectangular book", "rectangle"],
  ["shape-triangle", shapeTriangle, "A single yellow triangular warning sign", "triangle"],
];

export const finalTestPhotoAssets = Object.freeze(
  definitions.map(([assetId, src, alt, concept]) => {
    const source = sourceRecords[assetId] || inheritedPhotoSource;
    return {
      assetId,
      wordId: concept,
      conceptId: concept,
      src,
      filePath: `src/assets/final-test/photo/${assetId}.jpg`,
      alt,
      width: 1024,
      height: 768,
      sha256: fileHashes[assetId] || "",
      ...source,
      sourceWidth: source.sourceWidth || 1024,
      sourceHeight: source.sourceHeight || 768,
      transform: source.transform || "center crop and resize to 1024x768",
      reviewedAt,
    };
  }),
);

export const finalTestPhotoAssetsById = Object.freeze(
  Object.fromEntries(finalTestPhotoAssets.map((asset) => [asset.assetId, asset])),
);

export function getFinalTestPhotoAsset(assetId) {
  return finalTestPhotoAssetsById[assetId] || null;
}
