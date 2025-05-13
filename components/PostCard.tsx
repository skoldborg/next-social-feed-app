import type { Post } from '@/lib/types'
import Image from 'next/image'

export const PostCard = ({ author, avatar, content }: Post) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-200 text-zinc-800 shadow-sm mb-2 hover:scale-102 transition-transform">
      <div className="flex items-center gap-4 px-4 py-3">
        <figure className="self-start shrink-0 w-10 h-10 rounded-lg bg-gray-300 flex items-center justify-center overflow-hidden">
          {avatar ? (
            <Image
              src={avatar}
              width={150}
              height={150}
              alt={`${author}'s avatar`}
            />
          ) : (
            <span className="uppercase">{author.substring(0, 2)}</span>
          )}
        </figure>
        <div className="flex flex-col justify-center w-full">
          <h2 className="font-bold text-slate-700 truncate">{author}</h2>
          <p className="line-clamp-2 text-slate-500 text-sm">{content}</p>
        </div>
      </div>
    </div>
  )
}
