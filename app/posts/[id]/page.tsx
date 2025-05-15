import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSinglePostAction } from '@/app/actions'
import Image from 'next/image'

export default async function SinglePost({
  params,
}: {
  params: { id: string }
}) {
  const { id } = await params
  const post = await getSinglePostAction(id)

  if (!post) {
    notFound()
  }

  const { author, content, avatar } = post

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <Link href="/" className="bg-gray-300 text-zinc-800 px-4 py-2">
          Back to feed
        </Link>
      </div>
      <div className="bg-white rounded-lg flex items-center gap-4 px-4 py-3">
        <figure className="self-start shrink-0 w-30 h-30 rounded-lg bg-gray-300 flex items-center justify-center overflow-hidden">
          {avatar ? (
            <Image
              src={avatar}
              width={240}
              height={240}
              alt={`${author}'s avatar`}
            />
          ) : (
            <span className="uppercase">{author.substring(0, 2)}</span>
          )}
        </figure>
        <div className="flex flex-col justify-center w-full">
          <h1 className="font-bold text-2xl text-slate-700 mb-2">{author}</h1>
          <p className="text-slate-500 text-sm">{content}</p>
        </div>
      </div>
    </div>
  )
}
