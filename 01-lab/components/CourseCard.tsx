import Link from "next/link";

type CourseCardProps = {
  id: string;
  title: string;
  description: string;
  credits: number;
  likes: number;
};

export default function CourseCard(props: CourseCardProps) {
  const { id, title, description, credits, likes } = props

  return (
    <Link href={`/courses/${id}`} className="block border border-gray-300 p-6 rounded hover:bg-gray-50 text-black no-underline flex flex-col gap-3">
      <h2 className="text-xl font-bold">{title}</h2>
      <p>{description}</p>
      <div className="flex gap-6 text-sm text-gray-600 mt-2">
        <span>Credits: {credits}</span>
        <span>❤️ {likes}</span>
      </div>
    </Link>
  );
}
