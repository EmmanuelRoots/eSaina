import { UsePost } from "../../context/post"
import Column from "../column"
import { SalonItem } from "./salon-item"

const SalonComponent = () => {
  const { salons, selectSalon } = UsePost()
  console.log({ salons });


  return (
    <Column style={{ padding: '0 12px' }}>
      {
        salons?.map(s => <SalonItem key={s.id} salon={s} onClick={() => selectSalon(s)} />)
      }
    </Column>
  )
}

export default SalonComponent