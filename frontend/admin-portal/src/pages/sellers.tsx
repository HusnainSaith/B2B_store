import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { sellersApi, usersApi } from '@/services/api'
import type { Seller, User } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, CheckCircle, Trash2, Eye, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { useForm, Controller } from 'react-hook-form'
import { formResolver } from '@/lib/form'
import { z } from 'zod'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const createSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  displayName: z.string().min(1, 'Display name is required'),
  legalName: z.string().optional(),
  taxId: z.string().optional(),
})
type CreateFormData = z.infer<typeof createSchema>

export default function SellersPage() {
  const [detail, setDetail] = useState<Seller | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Seller | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['sellers'], queryFn: sellersApi.list })
  const { data: usersForDropdown } = useQuery({ queryKey: ['users', { page: 1, limit: 200, role: 'seller' }], queryFn: () => usersApi.list({ page: 1, limit: 200, role: 'seller' }) })
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<CreateFormData>({ resolver: formResolver(createSchema) })

  const createM = useMutation({
    mutationFn: sellersApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sellers'] }); setCreateOpen(false); reset(); toast.success('Seller created') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to create seller')),
  })

  const approveM = useMutation({
    mutationFn: (id: string) => sellersApi.approve(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sellers'] }); toast.success('Seller approved') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to approve')),
  })

  const rejectM = useMutation({
    mutationFn: (id: string) => sellersApi.update(id, { status: 'suspended' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sellers'] }); toast.success('Seller rejected') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to reject')),
  })

  const deleteM = useMutation({
    mutationFn: (id: string) => sellersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sellers'] }); setDeleteTarget(null); toast.success('Seller deleted') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to delete')),
  })

  const columns: ColumnDef<Seller>[] = [
    { accessorKey: 'displayName', header: ({ column }) => <SortHeader column={column}>Display Name</SortHeader> },
    { accessorKey: 'legalName', header: ({ column }) => <SortHeader column={column}>Legal Name</SortHeader>, cell: ({ row }) => row.original.legalName || '—' },
    { accessorKey: 'commissionRate', header: ({ column }) => <SortHeader column={column}>Commission %</SortHeader>, cell: ({ row }) => row.original.commissionRate != null ? `${row.original.commissionRate}%` : '—' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'createdAt', header: ({ column }) => <SortHeader column={column}>Joined</SortHeader>, cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetail(row.original)}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
            {row.original.status === 'pending' && (
              <DropdownMenuItem onClick={() => approveM.mutate(row.original.id)}>
                <CheckCircle className="mr-2 h-4 w-4" />Approve
              </DropdownMenuItem>
            )}
            {row.original.status === 'pending' && (
              <DropdownMenuItem onClick={() => rejectM.mutate(row.original.id)} className="text-orange-600">
                <XCircle className="mr-2 h-4 w-4" />Reject
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setDeleteTarget(row.original)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const allSellers = data ?? []
  const pendingCount = allSellers.filter((s) => s.status === 'pending').length
  const filteredSellers = statusFilter === 'all' ? allSellers : allSellers.filter((s) => s.status === statusFilter)

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Sellers" description="View and manage sellers" action={{ label: 'Add Seller', onClick: () => { reset({ userId: '', displayName: '', legalName: '', taxId: '' }); setCreateOpen(true) } }} />

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'All', value: 'all', count: allSellers.length },
          { label: 'Pending Approval', value: 'pending', count: pendingCount },
          { label: 'Active', value: 'active', count: allSellers.filter((s) => s.status === 'active').length },
          { label: 'Suspended', value: 'suspended', count: allSellers.filter((s) => s.status === 'suspended').length },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
              statusFilter === tab.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:bg-accent'
            }`}
          >
            {tab.label}
            {tab.value === 'pending' && tab.count > 0 ? (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full bg-amber-500 text-white">
                {tab.count}
              </span>
            ) : (
              <span className="text-xs opacity-60">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filteredSellers} isLoading={isLoading} isError={isError} onRetry={refetch} searchColumn="displayName" searchPlaceholder="Search sellers..."
        enableRowSelection
        onBulkDelete={(rows) => {
          Promise.allSettled(rows.map((r) => sellersApi.delete(r.id))).then((results) => {
            qc.invalidateQueries({ queryKey: ['sellers'] })
            const failed = results.filter((r) => r.status === 'rejected').length
            if (failed) toast.error(`${failed} of ${rows.length} failed to delete`)
            else toast.success(`${rows.length} seller(s) deleted`)
          })
        }}
        bulkStatusOptions={['active', 'suspended']}
        onBulkStatusChange={(rows, status) => {
          Promise.allSettled(rows.map((r) => sellersApi.update(r.id, { status }))).then((results) => {
            qc.invalidateQueries({ queryKey: ['sellers'] })
            const failed = results.filter((r) => r.status === 'rejected').length
            if (failed) toast.error(`${failed} of ${rows.length} failed to update`)
            else toast.success(`${rows.length} seller(s) updated`)
          })
        }}
        exportFilename="sellers"
        getExportRow={(r) => ({ DisplayName: r.displayName, LegalName: r.legalName ?? '', Commission: r.commissionRate ?? '', Status: r.status, Joined: r.createdAt })}
      />

      {/* Seller Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Seller Details</DialogTitle>
            <DialogDescription>{detail?.displayName}</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Display Name:</span><p className="font-medium">{detail.displayName}</p></div>
                <div><span className="text-muted-foreground">Legal Name:</span><p className="font-medium">{detail.legalName || '—'}</p></div>
                <div><span className="text-muted-foreground">Tax ID:</span><p className="font-medium">{detail.taxId || '—'}</p></div>
                <div><span className="text-muted-foreground">Commission:</span><p className="font-medium">{detail.commissionRate != null ? `${detail.commissionRate}%` : '—'}</p></div>
                <div><span className="text-muted-foreground">Status:</span><p><Badge variant="outline">{detail.status}</Badge></p></div>
                <div><span className="text-muted-foreground">Joined:</span><p className="font-medium">{formatDate(detail.createdAt)}</p></div>
              </div>
              {detail.status === 'pending' && (
                <DialogFooter className="gap-2">
                  <Button variant="outline" className="text-orange-600 border-orange-300 hover:bg-orange-50" onClick={() => { rejectM.mutate(detail.id); setDetail(null) }}>
                    <XCircle className="mr-1 h-4 w-4" />Reject
                  </Button>
                  <Button onClick={() => { approveM.mutate(detail.id); setDetail(null) }}>
                    <CheckCircle className="mr-1 h-4 w-4" />Approve Seller
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Seller" description={`Delete seller "${deleteTarget?.displayName}"? This action cannot be undone.`} confirmLabel="Delete" onConfirm={() => deleteTarget && deleteM.mutate(deleteTarget.id)} loading={deleteM.isPending} />

      {/* Create Seller Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Seller</DialogTitle><DialogDescription>Register a new seller account</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4">
            <div className="space-y-2">
              <Label>User</Label>
              <Controller name="userId" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select a user" /></SelectTrigger>
                  <SelectContent>
                    {(usersForDropdown?.data ?? []).map((u: User) => (
                      <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
              {errors.userId && <p className="text-xs text-destructive">{errors.userId.message}</p>}
            </div>
            <div className="space-y-2"><Label>Display Name</Label><Input {...register('displayName')} />{errors.displayName && <p className="text-xs text-destructive">{errors.displayName.message}</p>}</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Legal Name</Label><Input {...register('legalName')} /></div>
              <div className="space-y-2"><Label>Tax ID</Label><Input {...register('taxId')} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" disabled={createM.isPending}>Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
