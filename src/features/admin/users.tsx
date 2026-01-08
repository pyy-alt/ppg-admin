import { useEffect, useMemo, useState } from 'react'
import PersonApi from '@/js/clients/base/PersonApi'
import type Person from '@/js/models/Person'
import PersonSearchRequest from '@/js/models/PersonSearchRequest'
import ResultParameter from '@/js/models/ResultParameter'
import { type PersonSearchRequestType } from '@/js/models/enum/PersonSearchRequestTypeEnum'
import { Search, Plus, TableIcon, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { useDebouncedEffect } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Empty, EmptyHeader, EmptyMedia, EmptyDescription, EmptyTitle } from '@/components/ui/empty'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import NetworkUserDialog from '@/components/NetworkUserDialog'
import { ClearableInput } from '@/components/clearable-input'
import { DataTablePagination } from '@/components/data-table-pagination'
import { useTranslation } from 'react-i18next';

type filterByNetworkRoleType = 'Csr' | 'FieldStaff' | 'ProgramAdministrator'
export function Users() {
	const { t } = useTranslation()
	const [userOpen, setUserOpen] = useState(false)
	const [users, setUsers] = useState<Person[]>([])
	const [initUser, setInitUser] = useState<Person | null>(null)
	const [totalItems, setTotalItems] = useState(0)
	// Add status
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 20
	const totalPages = Math.ceil(totalItems / itemsPerPage)

	// Filter condition status
	const [smartFilter, setSmartFilter] = useState('')
	const [filterByNetworkRole, setFilterByNetworkRole] = useState<filterByNetworkRoleType | undefined>(undefined)
	const [includeInactiveFlag, setIncludeInactiveFlag] = useState(false)

	const [selectedRegionId, setSelectedRegionId] = useState<string>('all')

	const regions = useAuthStore(state => state.auth.user?.regions || [])

	const currentRegionId = useMemo(() => {
		return selectedRegionId === 'all' ? undefined : Number(selectedRegionId)
	}, [selectedRegionId])

	const selectedRegion = useMemo(() => {
		if (selectedRegionId === 'all' || !selectedRegionId) return null
		const found = regions.find(r => r.id === Number(selectedRegionId))
		if (found && found.id !== undefined && found.name) {
			return { id: found.id, name: found.name } as const
		}
		return null
	}, [selectedRegionId, regions])

	const getUsers = (
		smartFilter: string = '',
		includeInactiveFlag: boolean = false,
		filterByRegionId: number | undefined,
		filterByNetworkRole?: filterByNetworkRoleType,
		page: number = 1,
	) => {
		try {
			const request = PersonSearchRequest.create({
				smartFilter,
				includeInactiveFlag,
				type: 'Network' as PersonSearchRequestType,
				filterByRegionId,
				filterByNetworkRole,
			})
			// Add pagination parameters
			const resultParameter = ResultParameter.create({
				resultsLimitOffset: (page - 1) * itemsPerPage,
				resultsLimitCount: itemsPerPage,
				resultsOrderBy: 'dateLastAccess',
				resultsOrderAscending: false,
			})

			;(request as any).resultParameter = resultParameter
			const personApi = new PersonApi()

			personApi.search(request, {
				status200: response => {
					setUsers(response.persons)
					setTotalItems(response.totalItemCount)
				},
				error: error => {
					toast.error(error.message)
				},
			})
		} catch (error) {
			if (error && typeof error === 'object' && 'message' in error) {
				toast.error((error as any).message)
			} else {
				toast.error('An unexpected error occurred')
			}
		}
	}

	const getUserDetails = (user: Person) => {
		try {
			setInitUser(user)
			setUserOpen(true)
		} catch (error) {
			if (error && typeof error === 'object' && 'message' in error) {
				toast.error((error as any).message)
			} else {
				toast.error('An unexpected error occurred')
			}
		}
	}

	// Filter condition changes：Use debounce
	useDebouncedEffect(
		() => {
			getUsers(smartFilter, includeInactiveFlag, currentRegionId, filterByNetworkRole, currentPage)
		},
		[smartFilter, includeInactiveFlag, currentRegionId, filterByNetworkRole, currentPage],
		1000,
	)

	useEffect(() => {
		setCurrentPage(1)
	}, [smartFilter, includeInactiveFlag, currentRegionId, filterByNetworkRole])

	return (
		<div className="bg-background text-foreground min-h-screen">
			{/* Header */}
			<div className="bg-background border-b">
				<div className="flex items-center justify-between px-6 py-4">
					<h1 className="text-foreground text-2xl font-bold">{t('user.list.title')}</h1>
					<Button
						onClick={() => {
							setInitUser(null) // Clear previous user data
							setUserOpen(true)
						}}
					>
						<Plus className="mr-2 h-4 w-4" />
						{t('user.list.addNew')}
					</Button>
				</div>
			</div>

			<NetworkUserDialog
				open={userOpen}
				onOpenChange={setUserOpen}
				initialValues={initUser}
				filterByRegion={selectedRegion}
				onSuccess={() => {
					getUsers(smartFilter, includeInactiveFlag, currentRegionId, filterByNetworkRole)
				}}
				onError={error => {
					toast.error(error.message)
					// console.log(error)
				}}
			/>

			<div className="px-6 py-6">
				{/* Filters */}
				<div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
					<div className="relative max-w-md flex-1">
						<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<ClearableInput
							placeholder={t('user.list.searchPlaceholder')}
							value={smartFilter}
							onChange={e => setSmartFilter(e.target.value)}
							className="pl-10"
						/>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<Select
							value={filterByNetworkRole ?? 'all'}
							onValueChange={value =>
								setFilterByNetworkRole(value === 'all' ? undefined : (value as filterByNetworkRoleType))
							}
						>
							<SelectTrigger className="bg-muted w-48">
								<SelectValue placeholder={t('user.list.rolePlaceholder')} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t('user.list.role.all')}</SelectItem>
								<SelectItem value="Csr">{t('user.list.role.csr')}</SelectItem>
								<SelectItem value="FieldStaff">{t('user.list.role.fieldStaff')}</SelectItem>
								<SelectItem value="ProgramAdministrator">{t('user.list.role.programAdministrator')}</SelectItem>
							</SelectContent>
						</Select>

						<Select value={selectedRegionId} onValueChange={setSelectedRegionId}>
							<SelectTrigger className="bg-muted w-48">
								<SelectValue placeholder={t('user.list.regionPlaceholder')} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t('user.list.region.all')}</SelectItem>
								{regions.map((region: any) => (
									<SelectItem key={region.id} value={String(region.id)}>
										{region.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<div className="flex items-center gap-3">
							<Checkbox
								className="rounded-full"
								id="show-inactive"
								onCheckedChange={checked => setIncludeInactiveFlag(checked as boolean)}
							/>
							<Label htmlFor="show-inactive" className="cursor-pointer text-sm font-medium">
								{t('user.list.showInactive')}
							</Label>
						</div>
					</div>
				</div>
				{users.length === 0 ? (
					<div>
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<TableIcon className="h-4 w-4" />
								</EmptyMedia>
								<EmptyTitle>{t('common.empty.title')}</EmptyTitle>
								<EmptyDescription>
									{t('common.empty.description')}
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					</div>
				) : (
					<div>
						{/* Table */}
						<div className="bg-background overflow-hidden rounded-lg border shadow-sm">
							<Table>
								<TableHeader>
									<TableRow className="bg-muted">
										<TableHead className="text-foreground font-semibold">{t('user.list.tableHeaders.firstName')}</TableHead>
										<TableHead className="text-foreground font-semibold">{t('user.list.tableHeaders.lastName')}</TableHead>
										<TableHead className="text-foreground font-semibold">{t('user.list.tableHeaders.email')}</TableHead>
										<TableHead className="text-foreground font-semibold">{t('user.list.tableHeaders.role')}</TableHead>
										<TableHead className="text-foreground font-semibold">{t('user.list.tableHeaders.region')}</TableHead>
										<TableHead className="text-foreground font-semibold">{t('user.list.tableHeaders.dateAdded')}</TableHead>
										<TableHead className="text-foreground font-semibold">{t('user.list.tableHeaders.dateLastAccessed')}</TableHead>
										<TableHead className="text-foreground font-semibold">{t('user.list.tableHeaders.status')}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{users.map(user => (
										<TableRow key={user.email} className="hover:bg-background">
											<TableCell className="font-medium">
												<div className="flex items-center gap-1" onClick={() => getUserDetails(user)}>
													<Pencil className="h-4 w-4 hover:underline" />
													<span
														className={
															user.status === 'Pending'
																? 'cursor-pointer text-orange-600 hover:underline'
																: user.status === 'Inactive'
																	? 'text-gray-400'
																	: 'text-foreground cursor-pointer hover:underline'
														}
													>
														{user.firstName}
													</span>
												</div>
											</TableCell>
											<TableCell
												className={
													user.status === 'Inactive'
														? 'text-gray-400'
														: user.status === 'Pending'
															? 'text-orange-600'
															: ''
												}
											>
												{user.lastName}
											</TableCell>
											<TableCell className="text-sm">
												{user.status === 'Inactive' ? <span className="text-gray-400">{user.email}</span> : user.email}
											</TableCell>
											<TableCell>
												{user.status === 'Inactive' ? (
													<span className="text-gray-400">
														{user.type === 'Csr' ? 'CSR' : user.type}
													</span>
												) : (
													user.type === 'Csr' ? 'CSR' : user.type
												)}
											</TableCell>
											<TableCell className={user.status === 'Inactive' ? 'text-gray-400' : ''}>
												{user.type === 'Csr'
													? user.csrRegion?.name || '--'
													: user.type === 'FieldStaff'
														? user.fieldStaffRegions?.map((region: any) => region.name).join(', ') || '--'
														: user.type === 'ProgramAdministrator'
															? t('user.list.allRegions')
															: '--'}
											</TableCell>
											<TableCell>
												{user.status === 'Inactive' ? (
													<span className="text-gray-400">
														{(user.dateCreated && new Date(user.dateCreated).toLocaleDateString()) || '--'}
													</span>
												) : (
													(user.dateCreated && new Date(user.dateCreated).toLocaleDateString()) || '--'
												)}
											</TableCell>
											<TableCell
												className={
													user.status === 'Inactive'
														? 'text-gray-400'
														: user.status === 'Pending'
															? 'text-orange-600'
															: ''
												}
											>
												{(user.dateLastAccess && new Date(user.dateLastAccess).toLocaleDateString()) ||
													t('user.list.pendingRegistration')}
											</TableCell>
											<TableCell>
												{user.status === 'Inactive' ? (
													<span className="text-gray-400">{user.status}</span>
												) : (
													<span>{user.status}</span>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						{/* Pagination */}
						<DataTablePagination
							currentPage={currentPage}
							totalPages={totalPages}
							totalItems={totalItems}
							itemsPerPage={itemsPerPage}
							onPageChange={setCurrentPage}
						/>
					</div>
				)}
			</div>
		</div>
	)
}
