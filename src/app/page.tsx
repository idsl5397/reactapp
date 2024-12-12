import Base from "@/components/header"
import Index from "@/app/home/page"
import {Component} from "@/components/footer"

export default function Home() {
  return (
      <div className="flex flex-col min-h-screen">
          <Base/>
          <div className="flex-grow">
          <Index/>
          </div>
          <div className="fixed bottom-0 left-0 right-0">
              <Component/>
          </div>
      </div>
  );
}
