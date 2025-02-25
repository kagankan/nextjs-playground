import Image from "next/image";
import aiImageRight from "../_images/ai_talk_ai_right.png";
import aiImageLeft from "../_images/ai_talk_ai_left.png";

export const Visual = ({
  imageUrlA,
  imageUrlB,
}: {
  imageUrlA?: string;
  imageUrlB?: string;
}) => {
  return (
    <div className="w-full grid grid-cols-2 gap-[5%] ">
      <div className="relative pb-[min(2rem,15%)] pl-[min(2rem,15%)]">
        {imageUrlA ? (
          <div className=" aspect-video relative">
            <Image
              src={imageUrlA}
              alt=""
              fill
              style={{
                objectFit: "contain",
              }}
            />
          </div>
        ) : (
          <>
            <div className=" text-6xl md:text-8xl bg-red-500 text-white grid place-items-center aspect-video">
              ？
            </div>
            <Image
              src={aiImageLeft}
              alt=""
              className="absolute w-1/3 max-w-24 bottom-0 left-0"
            />
          </>
        )}
      </div>
      <div className="relative pb-[min(2rem,15%)] pr-[min(2rem,15%)]">
        {imageUrlB ? (
          <div className=" aspect-video relative">
            <Image
              src={imageUrlB}
              alt=""
              fill
              style={{
                objectFit: "contain",
              }}
            />
          </div>
        ) : (
          <>
            <div className=" text-6xl md:text-8xl bg-blue-500 text-white grid place-items-center aspect-video">
              ？
            </div>
            <Image
              src={aiImageRight}
              alt=""
              className="absolute w-1/3 max-w-24 bottom-0 right-0"
            />
          </>
        )}
      </div>
    </div>
  );
};
