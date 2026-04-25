import { GameLayout } from '../layout/GameLayout'
import { BuildingMenu } from '../../ui/panels/BuildingMenu'

export function GameRoute(): JSX.Element {
	return <GameLayout panels={<BuildingMenu />} />
}

export default GameRoute

