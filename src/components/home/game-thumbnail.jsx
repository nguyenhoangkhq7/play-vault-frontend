import Image from "next/image"

/**
 * @param {Object} props
 * @param {string} props.image - URL of the game thumbnail image
 * @param {string} props.name - Name of the game
 */
export default function GameThumbnail({ image, name }) {
  return (
    <div className="relative w-10 h-10 rounded-md overflow-hidden">
      <Image src={image || "/placeholder.svg"} alt={name} width={40} height={40} className="object-cover" />
    </div>
  )
}
