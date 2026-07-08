import { Container, Heading, Button, toast, Table, StatusBadge } from "@medusajs/ui"
import { useMutation, useQuery } from "@tanstack/react-query"
import { sdk } from "../../../lib/sdk"
import { defineRouteConfig } from "@medusajs/admin-sdk"

type WorkflowExecution = {
  id: string
  workflow_id: string
  transaction_id: string
  state: "completed" | "failed" | "invoking" | "waiting"
  created_at: string
  updated_at: string
}

const SanityPage = () => {
  const { data, isLoading, refetch } = useQuery<{
    workflow_executions: WorkflowExecution[]
    count: number
  }>({
    queryKey: ["sanity-syncs"],
    queryFn: () => sdk.client.fetch("/admin/sanity/syncs"),
    refetchInterval: 5000, // Poll every 5 seconds to get updated workflow status
  })

  const { mutate, isPending } = useMutation({
    mutationFn: () => 
      sdk.client.fetch("/admin/sanity/syncs", {
        method: "POST"
      }),
    onSuccess: () => {
      toast.success("Successfully triggered product sync to Sanity") 
      refetch()
    },
    onError: (err) => {
      console.error(err)
      toast.error("Failed to sync products to Sanity") 
    }
  })

  const handleSync = () => {
    mutate()
  }

  const getStatusColor = (state: WorkflowExecution["state"]) => {
    switch (state) {
      case "completed":
        return "green"
      case "failed":
        return "red"
      case "invoking":
        return "blue"
      default:
        return "grey"
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Sanity Integration</Heading>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your Sanity CMS product synchronization and view sync history.
          </p>
        </div>
        <Button 
          variant="primary"
          onClick={handleSync}
          isLoading={isPending}
        >
          Sync Products to Sanity
        </Button>
      </div>

      <div className="px-6 py-8">
        <Heading level="h3" className="mb-4">Recent Sync Runs</Heading>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading sync history...</p>
        ) : !data || data.workflow_executions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sync history found. Click the button above to start a sync.</p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Transaction ID</Table.HeaderCell>
                  <Table.HeaderCell>Date</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {data.workflow_executions.map((execution) => (
                  <Table.Row key={execution.id}>
                    <Table.Cell className="font-mono text-xs">
                      {execution.transaction_id}
                    </Table.Cell>
                    <Table.Cell className="text-sm">
                      {new Date(execution.created_at).toLocaleString()}
                    </Table.Cell>
                    <Table.Cell>
                      <StatusBadge color={getStatusColor(execution.state)}>
                        {execution.state.charAt(0).toUpperCase() + execution.state.slice(1)}
                      </StatusBadge>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Sanity CMS",
})

export default SanityPage
